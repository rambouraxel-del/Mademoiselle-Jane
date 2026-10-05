"use server";

import { createCheckout, cartInputSchema, countrySchema, quoteCart, type CheckoutResult } from "@/lib/checkout/checkout";
import type { Quote } from "@/lib/checkout/pricing";
import { isPreviewMode } from "@/lib/env";
import { PREVIEW_DISABLED } from "@/lib/preview/messages";
import { clientFingerprint, rateLimit } from "@/lib/security/request";

/** Recalcule le panier côté serveur (prix, disponibilité, livraison). */
export async function quoteCartAction(lines: unknown, country: unknown): Promise<Quote | { error: string }> {
  const parsedLines = cartInputSchema.safeParse(lines);
  const parsedCountry = countrySchema.safeParse(country);
  if (!parsedLines.success || !parsedCountry.success) return { error: "Panier invalide." };
  return quoteCart(parsedLines.data, parsedCountry.data);
}

/** Crée la commande et renvoie l'adresse de paiement Stripe. */
export async function startCheckoutAction(lines: unknown, country: unknown): Promise<CheckoutResult> {
  if (isPreviewMode()) return { ok: false, error: PREVIEW_DISABLED.checkout };
  const parsedLines = cartInputSchema.safeParse(lines);
  const parsedCountry = countrySchema.safeParse(country);
  if (!parsedLines.success || !parsedCountry.success) return { ok: false, error: "Panier invalide." };

  const fp = await clientFingerprint();
  if (!(await rateLimit("checkout", fp, 20, 3600))) {
    return { ok: false, error: "Trop de tentatives de paiement. Merci de réessayer plus tard." };
  }
  return createCheckout(parsedLines.data, parsedCountry.data);
}
