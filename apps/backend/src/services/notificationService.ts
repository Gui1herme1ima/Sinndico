import admin from 'firebase-admin';

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
