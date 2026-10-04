import "server-only";
import type Stripe from "stripe";
import { z } from "zod";
import { getPublishedProducts } from "@/lib/catalog/queries";
import { getShippingZones } from "@/lib/content/queries";
import { env, isStripeConfigured } from "@/lib/env";
import { getStripe } from "@/lib/payments/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { priceCart, type CartInputLine, type Quote } from "./pricing";

export const cartInputSchema = z
  .array(
    z.object({
      key: z.string().max(500),
      productId: z.uuid(),
      variantId: z.uuid().nullable(),
      quantity: z.number().int(),
      personalization: z
        .object({ name: z.string().max(100).optional(), phone: z.string().max(60).optional() })
        .strict(),
    }),
  )
  .max(30);

export const countrySchema = z.string().regex(/^[A-Z]{2}$/);

export async function quoteCart(lines: CartInputLine[], country: string): Promise<Quote> {
  const [products, zones] = await Promise.all([getPublishedProducts(), getShippingZones()]);
  return priceCart(lines, products, zones, country);
}

export type CheckoutResult =
  | { ok: true; url: string; orderNumber: string }
  | { ok: false; error: string; quote?: Quote };

type StripeLike = Pick<Stripe, "checkout">;

/**
 * Création d'une commande et de sa session Stripe Checkout.
 * Les montants envoyés à Stripe proviennent exclusivement du calcul serveur.
 */
export async function createCheckout(
  lines: CartInputLine[],
  country: string,
  stripe: StripeLike | null = null,
): Promise<CheckoutResult> {
  const quote = await quoteCart(lines, country);
  if (!quote.valid || !quote.zone) {
    return { ok: false, error: quote.issues[0] ?? "Panier invalide.", quote };
  }
  if (!stripe && !isStripeConfigured()) {
    return { ok: false, error: "Le paiement en ligne n’est pas encore activé sur la boutique.", quote };
  }
  const client = stripe ?? getStripe();
  const supabase = createServiceClient();
  const validLines = quote.lines.filter((l) => !l.error);

  const { data: created, error } = await supabase.rpc("create_order", {
    p_order: {
      subtotal_cents: quote.subtotalCents,
      shipping_cents: quote.shippingCents,
      total_cents: quote.totalCents,
      shipping_zone_id: quote.zone.id,
      shipping_zone_name: quote.zone.name,
      shipping_country: quote.country,
    },
    p_items: validLines.map((l) => ({
      product_id: l.productId,
      variant_id: l.variantId,
      product_name: l.productName,
      product_slug: l.productSlug,
      variant_name: l.variantName,
      size_label: l.sizeLabel,
      unit_price_cents: l.unitPriceCents,
      quantity: l.quantity,
      line_total_cents: l.lineTotalCents,
      personalization: l.personalization,
      image_path: l.imagePath,
      stock_limited: l.stockLimited,
    })),
  });
  if (error || !created || created.length === 0) {
    if (error?.message.includes("insufficient_stock")) {
      return { ok: false, error: "Un article vient d’être épuisé. Merci de vérifier votre panier.", quote };
    }
    return { ok: false, error: "La commande n’a pas pu être créée. Merci de réessayer.", quote };
  }
  const order = created[0];

  try {
    const session = await client.checkout.sessions.create(
      {
        mode: "payment",
        locale: "fr",
        currency: "eur",
        client_reference_id: order.order_id,
        metadata: { order_id: order.order_id, order_number: order.order_number },
        payment_intent_data: { metadata: { order_id: order.order_id, order_number: order.order_number } },
        line_items: validLines.map((l) => {
          const details = [
            l.personalization.name ? `Prénom : ${l.personalization.name}` : "",
            l.personalization.phone ? "Téléphone au dos" : "",
            l.sizeLabel ? `Diamètre ${l.sizeLabel}` : "",
          ]
            .filter(Boolean)
            .join(" · ");
          return {
            quantity: l.quantity,
            price_data: {
              currency: "eur",
              unit_amount: l.unitPriceCents,
              product_data: {
                name: `${l.productName}${l.variantName ? ` — ${l.variantName}` : ""}`,
                ...(details ? { description: details } : {}),
                ...(l.imageUrl && l.imageUrl.startsWith("https://") ? { images: [l.imageUrl] } : {}),
              },
            },
          };
        }),
        shipping_address_collection: {
          allowed_countries: quote.zone.countries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name: `Livraison — ${quote.zone.name}`,
              fixed_amount: { amount: quote.shippingCents, currency: "eur" },
            },
          },
        ],
        phone_number_collection: { enabled: true },
        billing_address_collection: "auto",
        expires_at: Math.floor(Date.now() / 1000) + 60 * 31,
        success_url: `${env.siteUrl}/commande/confirmation?ref=${order.public_token}`,
        cancel_url: `${env.siteUrl}/commande/annulee?ref=${order.public_token}`,
      },
      { idempotencyKey: `checkout-${order.order_id}` },
    );

    const { error: updateError } = await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.order_id);
    if (updateError || !session.url) throw new Error("session_not_saved");
    return { ok: true, url: session.url, orderNumber: order.order_number };
  } catch {
    await supabase.rpc("cancel_unpaid_order", { p_order_id: order.order_id });
    return { ok: false, error: "Le paiement n’a pas pu être initialisé. Merci de réessayer dans un instant.", quote };
  }
}
