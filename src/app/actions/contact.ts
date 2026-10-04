"use server";

import { z } from "zod";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email/send";
import { contactNotificationEmail } from "@/lib/email/templates";
import { clientFingerprint, rateLimit, verifyFormToken, verifyTurnstile } from "@/lib/security/request";
import { createServiceClient } from "@/lib/supabase/server";
import { cleanText, emailSchema, zodFieldErrors, type ActionResult } from "@/lib/validation/common";

const schema = z.object({
  name: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().min(2, { error: "Indiquez votre nom." }).max(120, { error: "Nom trop long." })),
  email: emailSchema,
  subject: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().max(200, { error: "Objet trop long." })),
  orderNumber: z
    .string()
    .transform((v) => cleanText(v).toUpperCase())
    .pipe(z.string().max(40).regex(/^[A-Z0-9-]*$/, { error: "Numéro de commande invalide." })),
  message: z
    .string()
    .transform((v) => cleanText(v, true))
    .pipe(
      z
        .string()
        .min(10, { error: "Votre message est un peu court (10 caractères minimum)." })
        .max(5000, { error: "Message trop long (5000 caractères maximum)." }),
    ),
});

export async function submitContact(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  // Champ piège : un robot le remplit, une personne ne le voit pas.
  if ((formData.get("website") ?? "").toString() !== "") {
    return { ok: true, message: "Merci, votre message a bien été envoyé." };
  }
  if (!verifyFormToken("contact", formData.get("formToken")?.toString())) {
    return { ok: false, error: "Le formulaire a expiré ou a été envoyé trop vite. Merci de réessayer." };
  }
  if (!(await verifyTurnstile(formData.get("cf-turnstile-response")?.toString(), env.turnstileSecretKey))) {
    return { ok: false, error: "La vérification anti-robot a échoué. Merci de réessayer." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    subject: formData.get("subject") ?? "",
    orderNumber: formData.get("orderNumber") ?? "",
    message: formData.get("message") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: "Merci de vérifier les champs indiqués.", fieldErrors: zodFieldErrors(parsed.error) };
  }

  // Liens multiples = spam probable
  const links = (parsed.data.message.match(/https?:\/\//gi) ?? []).length;
  if (links > 3) return { ok: false, error: "Votre message contient trop de liens." };

  const fp = await clientFingerprint();
  const allowed =
    (await rateLimit("contact-hour", fp, 5, 3600)) && (await rateLimit("contact-day", fp, 15, 86400));
  if (!allowed) return { ok: false, error: "Trop de messages envoyés. Merci de réessayer plus tard." };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      order_number: parsed.data.orderNumber,
      message: parsed.data.message,
    })
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, error: "Votre message n’a pas pu être enregistré. Merci de réessayer." };
  }

  if (env.shopNotificationEmail) {
    const mail = contactNotificationEmail(parsed.data, env.siteUrl);
    const sent = await sendEmail({ to: env.shopNotificationEmail, replyTo: parsed.data.email, ...mail });
    if (sent.ok) {
      await supabase.from("contact_messages").update({ notification_sent_at: new Date().toISOString() }).eq("id", data.id);
    }
  }

  return { ok: true, message: "Merci, votre message a bien été envoyé. Nous vous répondrons rapidement." };
}
