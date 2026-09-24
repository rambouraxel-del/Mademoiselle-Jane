import type { CartItem, CartSummary } from "./cart";
import type { CustomerAddress } from "./customer";

export type OrderStatus =
  | "en_attente_paiement"
  | "payee"
  | "en_fabrication"
  | "expediee"
  | "livree"
  | "annulee";

/**
 * Préparatoire pour l'intégration Stripe + Supabase. Une commande capture
 * un instantané des lignes panier au moment du paiement.
 */
export interface Order {
  id: string;
  customerId?: string;
  contactEmail: string;
  items: CartItem[];
  summary: CartSummary;
  shippingAddress?: CustomerAddress;
  status: OrderStatus;
  /** Identifiant de session/paiement Stripe (rempli au lot suivant). */
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}
