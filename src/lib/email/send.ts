import "server-only";
import { env, isEmailConfigured } from "@/lib/env";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type SendResult = { ok: true; id?: string } | { ok: false; error: string; skipped?: boolean };

/**
 * Envoi d'email via le prestataire configuré (EMAIL_PROVIDER) :
 *  - « resend » : API Resend (RESEND_API_KEY)
 *  - « smtp »   : tout serveur SMTP (Brevo, OVH, Gmail pro… ou Mailpit en local)
 *  - « none »   : aucun envoi (l'appelant est informé, rien n'est simulé)
 */
export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  if (!isEmailConfigured()) {
    return { ok: false, skipped: true, error: "Envoi d'emails non configuré." };
  }
  try {
    if (env.emailProvider === "resend") {
      const { Resend } = await import("resend");
      const resend = new Resend(env.resendApiKey);
      const { data, error } = await resend.emails.send({
        from: env.emailFrom!,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true, id: data?.id };
    }
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPassword } : undefined,
    });
    const info = await transport.sendMail({
      from: env.emailFrom,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo,
    });
    return { ok: true, id: info.messageId };
  } catch (error) {
    // Pas de données personnelles dans le message d'erreur journalisé.
    return { ok: false, error: error instanceof Error ? error.message.slice(0, 300) : "Erreur d'envoi." };
  }
}
