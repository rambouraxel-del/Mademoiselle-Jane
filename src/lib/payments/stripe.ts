import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";

let client: Stripe | null = null;

/** Client Stripe (clé secrète côté serveur uniquement). */
export function getStripe(): Stripe {
  if (!env.stripeSecretKey) {
    throw new Error("Stripe n'est pas configuré (STRIPE_SECRET_KEY).");
  }
  if (!client) {
    const mock = env.stripeMockUrl ? new URL(env.stripeMockUrl) : null;
    client = new Stripe(env.stripeSecretKey, {
      appInfo: { name: "Mademoizelle Jane" },
      maxNetworkRetries: 2,
      timeout: 20000,
      // Serveur stripe-mock : uniquement pour les tests automatisés.
      ...(mock
        ? { host: mock.hostname, port: mock.port || "12111", protocol: mock.protocol.replace(":", "") as "http" | "https" }
        : {}),
    });
  }
  return client;
}
