import "server-only";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email/send";
import { orderConfirmationEmail, shippingEmail, shopNewOrderEmail, type EmailOrder } from "@/lib/email/templates";
import { createServiceClient } from "@/lib/supabase/server";

async function loadEmailOrder(orderId: string): Promise<(EmailOrder & { email: string | null }) | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items (product_name, variant_name, quantity, line_total_cents, personalization)")
    .eq("id", orderId)
    .maybeSingle();
  if (!data) return null;
  return {
    email: data.customer_email,
    orderNumber: data.order_number,
    customerName: data.customer_name,
    subtotalCents: data.subtotal_cents,
    shippingCents: data.shipping_cents,
    totalCents: data.total_cents,
    shippingZoneName: data.shipping_zone_name,
    shippingAddress: (data.shipping_address ?? null) as Record<string, string | null> | null,
    carrier: data.carrier,
    trackingNumber: data.tracking_number,
    trackingUrl: data.tracking_url,
    publicToken: data.public_token,
    items: (data.order_items ?? []).map((i) => ({
      productName: i.product_name,
      variantName: i.variant_name,
      quantity: i.quantity,
      lineTotalCents: i.line_total_cents,
      personalization: (i.personalization ?? {}) as { name?: string; phone?: string },
    })),
  };
}

export type EmailOutcome = "sent" | "already_sent" | "not_configured" | "failed";

/**
 * Email de confirmation au client (une seule fois grâce à la réservation
 * atomique en base) + notification de nouvelle commande à l'atelier.
 */
export async function sendOrderConfirmation(orderId: string): Promise<EmailOutcome> {
  const supabase = createServiceClient();
  const order = await loadEmailOrder(orderId);
  if (!order) return "failed";

  // Notification atelier (au plus une fois)
  if (env.shopNotificationEmail) {
    const { data: claimed } = await supabase
      .from("orders")
      .update({ shop_notification_sent_at: new Date().toISOString() })
      .eq("id", orderId)
      .is("shop_notification_sent_at", null)
      .select("id");
    if (claimed && claimed.length > 0) {
      const mail = shopNewOrderEmail(order, env.siteUrl, orderId);
      const sent = await sendEmail({ to: env.shopNotificationEmail, ...mail });
      if (!sent.ok) {
        await supabase.from("orders").update({ shop_notification_sent_at: null }).eq("id", orderId);
      }
    }
  }

  const { data: mustSend, error } = await supabase.rpc("claim_order_email", { p_order_id: orderId, p_kind: "confirmation" });
  if (error) return "failed";
  if (!mustSend) return "already_sent";
  if (!order.email) {
    await supabase.rpc("finish_order_email", { p_order_id: orderId, p_kind: "confirmation", p_error: "Adresse email absente" });
    return "failed";
  }
  const mail = orderConfirmationEmail(order, env.siteUrl);
  const sent = await sendEmail({ to: order.email, replyTo: env.shopNotificationEmail, ...mail });
  await supabase.rpc("finish_order_email", {
    p_order_id: orderId,
    p_kind: "confirmation",
    p_error: sent.ok ? null : sent.error,
  } as { p_order_id: string; p_kind: string; p_error: string });
  if (sent.ok) return "sent";
  return "skipped" in sent && sent.skipped ? "not_configured" : "failed";
}

export async function sendShippingNotification(orderId: string): Promise<EmailOutcome> {
  const supabase = createServiceClient();
  const { data: mustSend, error } = await supabase.rpc("claim_order_email", { p_order_id: orderId, p_kind: "shipping" });
  if (error) return "failed";
  if (!mustSend) return "already_sent";
  const order = await loadEmailOrder(orderId);
  if (!order?.email) {
    await supabase.rpc("finish_order_email", { p_order_id: orderId, p_kind: "shipping", p_error: "Adresse email absente" });
    return "failed";
  }
  const mail = shippingEmail(order, env.siteUrl);
  const sent = await sendEmail({ to: order.email, replyTo: env.shopNotificationEmail, ...mail });
  await supabase.rpc("finish_order_email", {
    p_order_id: orderId,
    p_kind: "shipping",
    p_error: sent.ok ? null : sent.error,
  } as { p_order_id: string; p_kind: string; p_error: string });
  if (sent.ok) return "sent";
  return "skipped" in sent && sent.skipped ? "not_configured" : "failed";
}
