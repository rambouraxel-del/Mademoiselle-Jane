import type Stripe from "stripe";
import StripeSdk from "stripe";
import { env } from "@/lib/env";
import { processStripeEvent } from "@/lib/payments/webhook";

export const dynamic = "force-dynamic";

/**
 * Point de réception des événements Stripe.
 * La signature est vérifiée avec STRIPE_WEBHOOK_SECRET : un appel non signé
 * par Stripe est refusé. C'est le seul moyen de marquer une commande payée.
 */
export async function POST(request: Request) {
  if (!env.stripeWebhookSecret) {
    return new Response("webhook_not_configured", { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("missing_signature", { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = StripeSdk.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  } catch {
    return new Response("invalid_signature", { status: 400 });
  }

  const outcome = await processStripeEvent(event);
  return new Response(outcome.body, { status: outcome.status });
}
