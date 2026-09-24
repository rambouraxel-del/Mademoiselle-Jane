/**
 * Point d'entrée préparatoire pour Stripe (paiement).
 *
 * Non branché dans cette v1 — la page /commande explique que le paiement
 * arrive au prochain lot. Aucune clé secrète n'est utilisée ici.
 * Prochain lot :
 *   1. `npm install stripe @stripe/stripe-js`
 *   2. Renseigner STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY /
 *      STRIPE_WEBHOOK_SECRET dans .env.local (voir .env.example).
 *   3. Créer une route API (ex. src/app/api/checkout/route.ts) qui
 *      construit une session Stripe Checkout à partir de CartSummary,
 *      puis un webhook pour créer la commande (voir src/types/order.ts).
 */

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const isStripeConfigured = Boolean(STRIPE_PUBLISHABLE_KEY);

export function getStripePublishableKey() {
  if (!isStripeConfigured) {
    throw new Error(
      "Stripe n'est pas encore configuré. Renseignez NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY " +
        "et STRIPE_SECRET_KEY, puis installez le package stripe."
    );
  }
  return STRIPE_PUBLISHABLE_KEY!;
}
