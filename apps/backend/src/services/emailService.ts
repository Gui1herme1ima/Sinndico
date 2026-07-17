import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null | undefined;
let warnedMissingConfig = false;

// Lazy: só inicializa no primeiro envio, e só se as 4 env vars existirem. Sem elas vira um no-op
// (loga um aviso uma vez só) em vez de derrubar a operação principal — mesmo padrão do
// notificationService (FCM), até o usuário configurar o SMTP real da Hostinger.
function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !pass) {
    if (!warnedMissingConfig) {
      console.warn(
        '[emailService] SMTP não configurado (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD ausentes) — envio de e-mail desativado.'
      );
      warnedMissingConfig = true;
    }
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
  return transporter;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

// Nunca lança exceção — envio de e-mail é um efeito colateral best-effort, uma falha aqui não pode
// derrubar a operação principal (criação de condomínio/admin/usuário).
export async function sendEmail(message: EmailMessage): Promise<void> {
  const t = getTransporter();
  if (!t) return;

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
    console.log(`[emailService] e-mail "${message.subject}" enviado para ${message.to}`);
  } catch (err) {
    console.error('[emailService] erro ao enviar e-mail:', err);
  }
}

export function sendWelcomeEmail(
  to: string,
  params: { nome: string; loginUrl: string; senhaTemporaria: string }
): Promise<void> {
  return sendEmail({
    to,
    subject: 'Bem-vindo(a) ao Sinndico',
    html: `
      <p>Olá, ${params.nome}!</p>
      <p>Sua conta no Sinndico foi criada. Acesse pelo link abaixo:</p>
      <p><a href="${params.loginUrl}">${params.loginUrl}</a></p>
      <p>Senha temporária: <strong>${params.senhaTemporaria}</strong></p>
      <p>Você precisará trocar essa senha no primeiro acesso.</p>
    `,
  });
}
