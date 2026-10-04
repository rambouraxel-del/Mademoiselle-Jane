"use server";

import { z } from "zod";
import { assertAdmin } from "@/lib/auth/admin";
import { sendOrderConfirmation, sendShippingNotification, type EmailOutcome } from "@/lib/orders/emails";
import { cleanText, uuidSchema, type ActionResult } from "@/lib/validation/common";

const EMAIL_MESSAGES: Record<EmailOutcome, string> = {
  sent: "Email envoyé au client.",
  already_sent: "Cet email avait déjà été envoyé : pas de doublon.",
  not_configured: "L’envoi d’emails n’est pas encore configuré : aucun email envoyé.",
  failed: "L’email n’a pas pu être envoyé (voir l’erreur dans la commande).",
};

const schema = z.object({
  id: uuidSchema,
  fulfillmentStatus: z.enum(["new", "in_production", "ready", "shipped", "delivered", "cancelled"]),
  carrier: z.string().transform((v) => cleanText(v)).pipe(z.string().max(80)),
  trackingNumber: z.string().transform((v) => cleanText(v)).pipe(z.string().max(80)),
  trackingUrl: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().max(500).regex(/^(https:\/\/[^\s<>"]+)?$/, { error: "Le lien de suivi doit commencer par https://" })),
  internalNote: z.string().transform((v) => cleanText(v, true)).pipe(z.string().max(5000)),
  notify: z.boolean(),
});

/**
 * Mise à jour de la préparation / expédition. Le statut de PAIEMENT n'est
 * pas modifiable ici (seuls les événements Stripe signés le changent ;
 * la base de données l'interdit aussi au niveau des colonnes).
 */
export async function updateOrderFulfillment(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const parsed = schema.safeParse({
      id: formData.get("id"),
      fulfillmentStatus: formData.get("fulfillmentStatus"),
      carrier: formData.get("carrier") ?? "",
      trackingNumber: formData.get("trackingNumber") ?? "",
      trackingUrl: formData.get("trackingUrl") ?? "",
      internalNote: formData.get("internalNote") ?? "",
      notify: formData.get("notify") === "on",
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
    const d = parsed.data;

    const { data: current } = await admin.supabase.from("orders").select("payment_status, shipped_at").eq("id", d.id).maybeSingle();
    if (!current) return { ok: false, error: "Commande introuvable." };
    if (current.payment_status !== "paid" && ["in_production", "ready", "shipped", "delivered"].includes(d.fulfillmentStatus)) {
      return { ok: false, error: "Cette commande n’est pas payée : elle ne peut pas passer en fabrication ou en expédition." };
    }

    const { error } = await admin.supabase
      .from("orders")
      .update({
        fulfillment_status: d.fulfillmentStatus,
        carrier: d.carrier,
        tracking_number: d.trackingNumber,
        tracking_url: d.trackingUrl,
        internal_note: d.internalNote,
        shipped_at: d.fulfillmentStatus === "shipped" || d.fulfillmentStatus === "delivered" ? (current.shipped_at ?? new Date().toISOString()) : current.shipped_at,
      })
      .eq("id", d.id);
    if (error) return { ok: false, error: "Enregistrement impossible." };

    let message = "Commande mise à jour.";
    if (d.fulfillmentStatus === "shipped" && d.notify) {
      const outcome = await sendShippingNotification(d.id);
      message += ` ${EMAIL_MESSAGES[outcome]}`;
    }
    return { ok: true, message };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function resendConfirmation(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin();
    const id = uuidSchema.safeParse(formData.get("id"));
    if (!id.success) return { ok: false, error: "Commande introuvable." };
    const outcome = await sendOrderConfirmation(id.data);
    return outcome === "sent" || outcome === "already_sent" ? { ok: true, message: EMAIL_MESSAGES[outcome] } : { ok: false, error: EMAIL_MESSAGES[outcome] };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
