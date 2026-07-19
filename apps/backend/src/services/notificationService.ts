import admin from 'firebase-admin';

import { TenantContext } from '../database/tenantContext';
import { listTokensForUsers } from '../models/DeviceToken';
import { createNotificacoes, NotificacaoTipo } from '../models/Notificacao';

let firebaseApp: admin.app.App | null | undefined;
let warnedMissingConfig = false;

// Lazy: só inicializa na primeira notificação, e só se as 3 env vars existirem. Se não existirem,
// vira um no-op (loga um aviso uma vez só) em vez de derrubar o servidor — não temos projeto
// Firebase configurado ainda neste ambiente, então isso é esperado até o usuário configurar.
function getFirebaseApp(): admin.app.App | null {
  if (firebaseApp !== undefined) return firebaseApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    if (!warnedMissingConfig) {
      console.warn(
        '[notificationService] Firebase não configurado (FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY ausentes) — notificações push desativadas.'
      );
      warnedMissingConfig = true;
    }
    firebaseApp = null;
    return firebaseApp;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
  return firebaseApp;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
}

// Nunca lança exceção — notificação é um efeito colateral best-effort, uma falha aqui não pode
// derrubar a operação principal (criar encomenda/comunicado/mensagem).
export async function sendPushToTokens(tokens: string[], notification: PushNotification): Promise<void> {
  if (tokens.length === 0) return;

  const app = getFirebaseApp();
  if (!app) return;

  try {
    const response = await app.messaging().sendEachForMulticast({
      tokens,
      notification: { title: notification.title, body: notification.body },
      data: notification.data,
    });
    console.log(`[notificationService] push "${notification.title}": ${response.successCount} ok, ${response.failureCount} falhas`);
  } catch (err) {
    console.error('[notificationService] erro ao enviar push:', err);
  }
}

export interface NotifyUsersInput {
  tipo: NotificacaoTipo;
  titulo: string;
  corpo: string;
  referenciaId: string;
}

// Ponto único chamado pelos controllers pra qualquer evento que precise avisar usuários: grava a
// notificação in-app (uma linha por destinatário) e dispara o push pros mesmos usuários. Nunca
// lança — mesma postura best-effort do sendPushToTokens; grava a notificação antes de tentar o
// push porque é a parte mais importante (o push pode falhar silenciosamente sem prejuízo).
export async function notifyUsers(ctx: TenantContext, userIds: string[], input: NotifyUsersInput): Promise<void> {
  if (userIds.length === 0) return;

  try {
    await createNotificacoes(ctx, userIds, input);
  } catch (err) {
    console.error('[notificationService] erro ao gravar notificação in-app:', err);
  }

  const tokens = await listTokensForUsers(ctx, userIds);
  await sendPushToTokens(tokens, {
    title: input.titulo,
    body: input.corpo,
    data: { tipo: input.tipo, referenciaId: input.referenciaId },
  });
}
