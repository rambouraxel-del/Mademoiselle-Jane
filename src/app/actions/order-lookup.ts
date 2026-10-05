"use server";

import { z } from "zod";
import { isPreviewMode } from "@/lib/env";
import { FULFILLMENT_LABELS, PAYMENT_LABELS } from "@/lib/orders/labels";
import { PREVIEW_DISABLED } from "@/lib/preview/messages";
import { clientFingerprint, rateLimit } from "@/lib/security/request";
import { createServiceClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/validation/common";

export type LookupResult =
  | {
      ok: true;
      order: {
        number: string;
        createdAt: string;
        payment: string;
        fulfillment: string;
        carrier: string;
        trackingNumber: string;
        trackingUrl: string;
        items: string[];
      };
    }
  | { ok: false; error: string };

const schema = z.object({
  number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^MJ-\d{4}-\d{5,}$/, { error: "Numéro de commande invalide (ex. MJ-2026-00001)." }),
  email: emailSchema,
});

/** Suivi d'une commande avec son numéro ET l'email utilisé (tentatives limitées). */
export async function lookupOrder(_prev: LookupResult | null, formData: FormData): Promise<LookupResult> {
  if (isPreviewMode()) return { ok: false, error: PREVIEW_DISABLED.lookup };
  const parsed = schema.safeParse({ number: formData.get("number") ?? "", email: formData.get("email") ?? "" });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  const fp = await clientFingerprint();
  if (!(await rateLimit("order-lookup", fp, 10, 3600))) {
    return { ok: false, error: "Trop de tentatives. Merci de réessayer dans une heure." };
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("order_number, created_at, payment_status, fulfillment_status, carrier, tracking_number, tracking_url, customer_email, order_items (product_name, variant_name, quantity)")
    .eq("order_number", parsed.data.number)
    .maybeSingle();

  // Même message que la commande existe ou non : aucune information divulguée.
  if (!data || !data.customer_email || data.customer_email.toLowerCase() !== parsed.data.email) {
    return { ok: false, error: "Aucune commande ne correspond à ces informations." };
  }
  return {
    ok: true,
    order: {
      number: data.order_number,
      createdAt: data.created_at,
      payment: PAYMENT_LABELS[data.payment_status],
      fulfillment: FULFILLMENT_LABELS[data.fulfillment_status],
      carrier: data.carrier,
      trackingNumber: data.tracking_number,
      trackingUrl: /^https:\/\//.test(data.tracking_url) ? data.tracking_url : "",
      items: (data.order_items ?? []).map(
        (i) => `${i.product_name}${i.variant_name ? ` — ${i.variant_name}` : ""} × ${i.quantity}`,
      ),
    },
  };
}
