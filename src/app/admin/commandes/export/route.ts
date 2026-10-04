import { NextResponse, type NextRequest } from "next/server";
import { ordersQuery, parseOrderFilters } from "@/lib/admin/orders";
import { getAdmin } from "@/lib/auth/admin";
import { FULFILLMENT_LABELS, PAYMENT_LABELS, type FulfillmentStatus, type PaymentStatus } from "@/lib/orders/labels";

function cell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  // Protection contre l'injection de formules dans un tableur
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

const euros = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2).replace(".", ","));

type Row = {
  order_number: string;
  created_at: string;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: Record<string, string | null> | null;
  shipping_zone_name: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  carrier: string;
  tracking_number: string;
  internal_note: string;
  order_items: { quantity: number; product_name: string; variant_name: string; personalization: { name?: string; phone?: string } }[];
};

export async function GET(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return new NextResponse("Accès refusé", { status: 403 });
  const filters = parseOrderFilters(Object.fromEntries(request.nextUrl.searchParams));
  const { data, error } = await ordersQuery(
    admin,
    filters,
    "order_number, created_at, payment_status, fulfillment_status, customer_name, customer_email, customer_phone, shipping_address, shipping_zone_name, subtotal_cents, shipping_cents, total_cents, carrier, tracking_number, internal_note, order_items (quantity, product_name, variant_name, personalization)",
  ).limit(5000);
  if (error) return new NextResponse("Export impossible", { status: 500 });

  const header = ["Numéro", "Date", "Paiement", "Préparation", "Nom", "Email", "Téléphone", "Adresse", "Code postal", "Ville", "Pays", "Zone", "Articles", "Prénoms gravés", "Téléphones au dos", "Sous-total (€)", "Livraison (€)", "Total (€)", "Transporteur", "N° de suivi", "Note interne"];
  const lines = ((data ?? []) as unknown as Row[]).map((o) => {
    const a = o.shipping_address ?? {};
    return [
      o.order_number,
      new Date(o.created_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" }),
      PAYMENT_LABELS[o.payment_status],
      FULFILLMENT_LABELS[o.fulfillment_status],
      o.customer_name,
      o.customer_email,
      o.customer_phone,
      [a.line1, a.line2].filter(Boolean).join(", "),
      a.postal_code,
      a.city,
      a.country,
      o.shipping_zone_name,
      o.order_items.map((i) => `${i.quantity} x ${i.product_name}${i.variant_name ? ` - ${i.variant_name}` : ""}`).join(" | "),
      o.order_items.map((i) => i.personalization?.name ?? "").join(" | "),
      o.order_items.map((i) => i.personalization?.phone ?? "").join(" | "),
      euros(o.subtotal_cents),
      euros(o.shipping_cents),
      euros(o.total_cents),
      o.carrier,
      o.tracking_number,
      o.internal_note,
    ]
      .map(cell)
      .join(";");
  });
  const csv = "﻿" + [header.map(cell).join(";"), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
