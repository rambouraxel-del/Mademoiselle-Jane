import "server-only";
import type Stripe from "stripe";
import { sendOrderConfirmation } from "@/lib/orders/emails";
import { createServiceClient } from "@/lib/supabase/server";

export type WebhookOutcome = { status: number; body: string };

function customerFromSession(session: Stripe.Checkout.Session) {
  const shipping = session.collected_information?.shipping_details ?? null;
  const details = session.customer_details;
  const address = shipping?.address ?? details?.address ?? null;
  return {
    email: details?.email ?? null,
    name: shipping?.name ?? details?.name ?? null,
    phone: details?.phone ?? null,
    address: address
      ? {
          line1: address.line1 ?? null,
          line2: address.line2 ?? null,
          postal_code: address.postal_code ?? null,
          city: address.city ?? null,
          state: address.state ?? null,
          country: address.country ?? null,
        }
      : null,
  };
}

function paymentIntentId(value: string | Stripe.PaymentIntent | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

class OrderNotFound extends Error {}

function rpcError(error: { message: string } | null) {
  if (!error) return;
  if (error.message.includes("order_not_found")) throw new OrderNotFound(error.message);
  throw new Error(error.message);
}

/** Applique un événement Stripe (déjà authentifié) à la commande correspondante. */
async function applyEvent(event: Stripe.Event): Promise<void> {
  const supabase = createServiceClient();
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const isPaid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
      const { data, error } = await supabase.rpc("payment_checkout_completed", {
        p_session_id: session.id,
        p_payment_intent: paymentIntentId(session.payment_intent) as string,
        p_amount_total: session.amount_total ?? 0,
        p_is_paid: isPaid,
        p_customer: customerFromSession(session),
      });
      rpcError(error);
      const row = data?.[0];
      if (row?.payment_status === "paid") await sendOrderConfirmation(row.order_id);
      return;
    }
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const { data, error } = await supabase.rpc("payment_async_succeeded", {
        p_session_id: session.id,
        p_amount_total: session.amount_total ?? 0,
      });
      rpcError(error);
      const row = data?.[0];
      if (row?.payment_status === "paid") await sendOrderConfirmation(row.order_id);
      return;
    }
    case "checkout.session.async_payment_failed": {
      const { error } = await supabase.rpc("payment_closed", { p_session_id: event.data.object.id, p_status: "failed" });
      rpcError(error);
      return;
    }
    case "checkout.session.expired": {
      const { error } = await supabase.rpc("payment_closed", { p_session_id: event.data.object.id, p_status: "expired" });
      rpcError(error);
      return;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const pi = paymentIntentId(charge.payment_intent);
      if (!pi) return;
      const { error } = await supabase.rpc("payment_refunded", {
        p_payment_intent: pi,
        p_fully: charge.amount_refunded >= charge.amount,
      });
      rpcError(error);
      return;
    }
    default:
      return; // Événement non utilisé : accusé de réception simple.
  }
}

/**
 * Traitement idempotent : chaque événement Stripe est enregistré par son
 * identifiant ; un événement déjà traité n'est jamais rejoué. En cas
 * d'erreur, on répond 500 pour que Stripe renvoie l'événement plus tard.
 */
export async function processStripeEvent(event: Stripe.Event): Promise<WebhookOutcome> {
  const supabase = createServiceClient();
  await supabase.from("stripe_events").upsert({ id: event.id, type: event.type }, { onConflict: "id", ignoreDuplicates: true });
  const { data: record, error: readError } = await supabase
    .from("stripe_events")
    .select("processed_at, attempts")
    .eq("id", event.id)
    .single();
  if (readError || !record) return { status: 500, body: "event_store_unavailable" };
  if (record.processed_at) return { status: 200, body: "already_processed" };

  try {
    await applyEvent(event);
    await supabase
      .from("stripe_events")
      .update({ processed_at: new Date().toISOString(), attempts: record.attempts + 1, last_error: null })
      .eq("id", event.id);
    return { status: 200, body: "processed" };
  } catch (error) {
    if (error instanceof OrderNotFound) {
      // Session étrangère à cette boutique (même compte Stripe) : rien à faire.
      await supabase
        .from("stripe_events")
        .update({ processed_at: new Date().toISOString(), attempts: record.attempts + 1, last_error: "order_not_found" })
        .eq("id", event.id);
      return { status: 200, body: "ignored_unknown_order" };
    }
    await supabase
      .from("stripe_events")
      .update({ attempts: record.attempts + 1, last_error: error instanceof Error ? error.message.slice(0, 300) : "error" })
      .eq("id", event.id);
    return { status: 500, body: "processing_failed" };
  }
}
