"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { env, isPreviewMode } from "@/lib/env";
import { PREVIEW_DISABLED } from "@/lib/preview/messages";
import { CONSENT_TEXT } from "@/lib/newsletter/consent";
import { getSettings } from "@/lib/content/queries";
import { sendEmail } from "@/lib/email/send";
import { newsletterConfirmEmail } from "@/lib/email/templates";
import { clientFingerprint, rateLimit } from "@/lib/security/request";
import { createServiceClient } from "@/lib/supabase/server";
import { emailSchema, type ActionResult } from "@/lib/validation/common";


const schema = z.object({
  email: emailSchema,
  consent: z.literal("on", { error: "Merci de cocher la case de consentement." }),
  website: z.string().max(0).optional(), // champ piège invisible
});

function token() {
  return randomBytes(24).toString("hex");
}

export async function subscribeNewsletter(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (isPreviewMode()) return { ok: false, error: PREVIEW_DISABLED.newsletter };
  const settings = await getSettings();
  if (!settings.general.newsletter_enabled) return { ok: false, error: "La newsletter n’est pas disponible." };

  const parsed = schema.safeParse({
    email: formData.get("email") ?? "",
    consent: formData.get("consent") ?? undefined,
    website: formData.get("website") ?? "",
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? "Formulaire invalide." };
  }

  const fp = await clientFingerprint();
  if (!(await rateLimit("newsletter", fp, 5, 3600))) {
    return { ok: false, error: "Trop de tentatives. Merci de réessayer plus tard." };
  }

  const supabase = createServiceClient();
  const email = parsed.data.email;
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  const done: ActionResult = {
    ok: true,
    message: "Merci ! Un email de confirmation vous a été envoyé : cliquez sur le lien pour valider votre inscription.",
  };
  if (existing?.status === "confirmed") return done;

  const confirmToken = token();
  const unsubscribeToken = token();
  const values = {
    email,
    status: "pending" as const,
    consent_text: CONSENT_TEXT,
    consent_at: new Date().toISOString(),
    confirm_token: confirmToken,
    unsubscribe_token: unsubscribeToken,
    unsubscribed_at: null,
  };
  const { error } = existing
    ? await supabase.from("newsletter_subscribers").update(values).eq("id", existing.id)
    : await supabase.from("newsletter_subscribers").insert(values);
  if (error) return { ok: false, error: "Inscription impossible pour le moment. Merci de réessayer." };

  const mail = newsletterConfirmEmail(
    `${env.siteUrl}/newsletter/confirmer?token=${confirmToken}`,
    `${env.siteUrl}/newsletter/desinscription?token=${unsubscribeToken}`,
    env.siteUrl,
  );
  const sent = await sendEmail({ to: email, ...mail });
  if (!sent.ok) {
    return {
      ok: true,
      message: "Merci, votre demande est enregistrée. L’email de confirmation n’a pas pu être envoyé pour l’instant.",
    };
  }
  return done;
}

const tokenSchema = z.string().regex(/^[0-9a-f]{48}$/);

export async function confirmNewsletter(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (isPreviewMode()) return { ok: false, error: PREVIEW_DISABLED.newsletter };
  const parsed = tokenSchema.safeParse(formData.get("token"));
  if (!parsed.success) return { ok: false, error: "Lien invalide." };
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("confirm_token", parsed.data)
    .eq("status", "pending")
    .select("id");
  if (error) return { ok: false, error: "Confirmation impossible pour le moment." };
  if (!data || data.length === 0) return { ok: false, error: "Ce lien a déjà été utilisé ou n’est plus valide." };
  return { ok: true, message: "Votre inscription est confirmée. Merci !" };
}

export async function unsubscribeNewsletter(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (isPreviewMode()) return { ok: false, error: PREVIEW_DISABLED.newsletter };
  const parsed = tokenSchema.safeParse(formData.get("token"));
  if (!parsed.success) return { ok: false, error: "Lien invalide." };
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", parsed.data)
    .select("id");
  if (error) return { ok: false, error: "Désinscription impossible pour le moment." };
  if (!data || data.length === 0) return { ok: false, error: "Lien invalide." };
  return { ok: true, message: "Vous êtes désinscrit·e. Vous ne recevrez plus la newsletter." };
}
