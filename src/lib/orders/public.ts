import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

export const PUBLIC_TOKEN_PATTERN = /^[0-9a-f]{48}$/;

export type PublicOrder = {
  orderNumber: string;
  paymentStatus: import("./labels").PaymentStatus;
  fulfillmentStatus: import("./labels").FulfillmentStatus;
  createdAt: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingZoneName: string;
  firstName: string | null;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  items: {
    productName: string;
    variantName: string;
    quantity: number;
    lineTotalCents: number;
    personalization: { name?: string; phone?: string };
  }[];
};

/**
 * Commande consultable par son jeton non devinable (lien reçu après paiement).
 * Ne renvoie aucune adresse ni coordonnée complète.
 */
export async function getOrderByToken(token: string): Promise<PublicOrder | null> {
  if (!PUBLIC_TOKEN_PATTERN.test(token)) return null;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_number, payment_status, fulfillment_status, created_at, subtotal_cents, shipping_cents, total_cents, shipping_zone_name, customer_name, tracking_number, tracking_url, carrier, order_items (product_name, variant_name, quantity, line_total_cents, personalization)",
    )
    .eq("public_token", token)
    .maybeSingle();
  if (error || !data) return null;
  return {
    orderNumber: data.order_number,
    paymentStatus: data.payment_status,
    fulfillmentStatus: data.fulfillment_status,
    createdAt: data.created_at,
    subtotalCents: data.subtotal_cents,
    shippingCents: data.shipping_cents,
    totalCents: data.total_cents,
    shippingZoneName: data.shipping_zone_name,
    firstName: data.customer_name ? data.customer_name.split(" ")[0] : null,
    trackingNumber: data.tracking_number,
    trackingUrl: data.tracking_url,
    carrier: data.carrier,
    items: (data.order_items ?? []).map((i) => ({
      productName: i.product_name,
      variantName: i.variant_name,
      quantity: i.quantity,
      lineTotalCents: i.line_total_cents,
      personalization: (i.personalization ?? {}) as { name?: string; phone?: string },
    })),
  };
}
