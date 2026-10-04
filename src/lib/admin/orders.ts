import "server-only";
import type { AdminSession } from "@/lib/auth/admin";
import type { FulfillmentStatus, PaymentStatus } from "@/lib/orders/labels";

export type OrderFilters = { q: string; paiement: string; preparation: string; page: number };

export const PAGE_SIZE = 30;

export function parseOrderFilters(sp: Record<string, string | string[] | undefined>): OrderFilters {
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).slice(0, 80) : "");
  return { q: s("q").trim(), paiement: s("paiement"), preparation: s("preparation"), page: Math.max(1, Number(s("page")) || 1) };
}

const PAYMENTS: PaymentStatus[] = ["pending", "processing", "paid", "failed", "expired", "cancelled", "refunded", "review"];
const FULFILLMENTS: FulfillmentStatus[] = ["new", "in_production", "ready", "shipped", "delivered", "cancelled"];

/** Requête des commandes filtrée (administration), sans SQL dynamique. */
export function ordersQuery(admin: AdminSession, f: OrderFilters, select: string) {
  let query = admin.supabase.from("orders").select(select, { count: "exact" }).order("created_at", { ascending: false });
  if (f.paiement === "a-traiter") {
    query = query.eq("payment_status", "paid").in("fulfillment_status", ["new", "in_production", "ready"]);
  } else if (PAYMENTS.includes(f.paiement as PaymentStatus)) {
    query = query.eq("payment_status", f.paiement as PaymentStatus);
  } else if (f.paiement !== "toutes") {
    // Par défaut : on masque les paniers jamais payés (expirés / annulés).
    query = query.not("payment_status", "in", "(expired,cancelled)");
  }
  if (FULFILLMENTS.includes(f.preparation as FulfillmentStatus)) {
    query = query.eq("fulfillment_status", f.preparation as FulfillmentStatus);
  }
  if (f.q) {
    const safe = f.q.replace(/[%_,()*:"\\]/g, " ").trim();
    if (safe) query = query.or(`order_number.ilike.%${safe}%,customer_email.ilike.%${safe}%,customer_name.ilike.%${safe}%`);
  }
  return query;
}
