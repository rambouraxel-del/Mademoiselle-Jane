import type { Database } from "@/lib/supabase/database.types";

export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type FulfillmentStatus = Database["public"]["Enums"]["fulfillment_status"];

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: "En attente de paiement",
  processing: "Paiement en cours de traitement",
  paid: "Payée",
  failed: "Paiement échoué",
  expired: "Paiement non finalisé (expiré)",
  cancelled: "Annulée avant paiement",
  refunded: "Remboursée",
  review: "Paiement à vérifier",
};

export const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  new: "À traiter",
  in_production: "En fabrication",
  ready: "Prête à expédier",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export const FULFILLMENT_ORDER: FulfillmentStatus[] = ["new", "in_production", "ready", "shipped", "delivered", "cancelled"];

export const PAYMENT_TONE: Record<PaymentStatus, "ok" | "wait" | "bad" | "neutral"> = {
  pending: "wait",
  processing: "wait",
  paid: "ok",
  failed: "bad",
  expired: "neutral",
  cancelled: "neutral",
  refunded: "neutral",
  review: "bad",
};
