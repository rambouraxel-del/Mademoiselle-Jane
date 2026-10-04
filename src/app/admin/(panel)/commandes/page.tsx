import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyState, PageHeader, btnSecondary, inputClass } from "@/components/admin/ui";
import { PAGE_SIZE, ordersQuery, parseOrderFilters } from "@/lib/admin/orders";
import { requireAdmin } from "@/lib/auth/admin";
import { formatDateTime, formatPrice } from "@/lib/format";
import { FULFILLMENT_LABELS, FULFILLMENT_ORDER, PAYMENT_LABELS, PAYMENT_TONE, type FulfillmentStatus, type PaymentStatus } from "@/lib/orders/labels";

export const metadata: Metadata = { title: "Commandes" };

type Row = {
  id: string;
  order_number: string;
  created_at: string;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  total_cents: number;
  customer_name: string | null;
  customer_email: string | null;
  order_items: { quantity: number; product_name: string; variant_name: string; personalization: { name?: string } }[];
};

export default async function OrdersPage({ searchParams }: PageProps<"/admin/commandes">) {
  const admin = await requireAdmin();
  const f = parseOrderFilters(await searchParams);
  const from = (f.page - 1) * PAGE_SIZE;
  const { data, count, error } = await ordersQuery(
    admin,
    f,
    "id, order_number, created_at, payment_status, fulfillment_status, total_cents, customer_name, customer_email, order_items (quantity, product_name, variant_name, personalization)",
  ).range(from, from + PAGE_SIZE - 1);
  const rows = (data ?? []) as unknown as Row[];
  const qs = new URLSearchParams(Object.entries({ q: f.q, paiement: f.paiement, preparation: f.preparation }).filter(([, v]) => v));
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Commandes"
        description="Le statut de paiement provient uniquement de Stripe. Vous gérez la fabrication et l’expédition."
        actions={<a href={`/admin/commandes/export?${qs.toString()}`} className={btnSecondary}>Exporter en CSV</a>}
      />
      <form method="get" className="mb-5 grid gap-2 rounded-md border border-line bg-white p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="visually-hidden" htmlFor="o-q">Rechercher</label>
        <input id="o-q" name="q" defaultValue={f.q} placeholder="N° de commande, nom ou email" className={inputClass} />
        <label className="visually-hidden" htmlFor="o-pay">Paiement</label>
        <select id="o-pay" name="paiement" defaultValue={f.paiement} className={inputClass}>
          <option value="">Paiement : toutes sauf abandonnées</option>
          <option value="a-traiter">À traiter (payées, non expédiées)</option>
          {Object.entries(PAYMENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          <option value="toutes">Toutes, y compris abandonnées</option>
        </select>
        <label className="visually-hidden" htmlFor="o-prep">Préparation</label>
        <select id="o-prep" name="preparation" defaultValue={f.preparation} className={inputClass}>
          <option value="">Préparation : toutes</option>
          {FULFILLMENT_ORDER.map((v) => <option key={v} value={v}>{FULFILLMENT_LABELS[v]}</option>)}
        </select>
        <button type="submit" className={btnSecondary}>Filtrer</button>
      </form>

      {error ? <p className="text-danger">Lecture des commandes impossible.</p> : null}
      {rows.length === 0 ? (
        <EmptyState>Aucune commande ne correspond.</EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white">
          {rows.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/commandes/${o.id}`} className="grid gap-2 p-3 hover:bg-ivory/60 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_auto] md:items-center">
                <span>
                  <span className="font-medium text-ink">{o.order_number}</span>
                  <span className="block text-xs text-brown-soft">{formatDateTime(o.created_at)}</span>
                  <span className="block text-sm">{o.customer_name ?? "—"}</span>
                </span>
                <span className="text-sm text-brown">
                  {o.order_items.map((i, k) => (
                    <span key={k} className="block">
                      {i.quantity} × {i.product_name}
                      {i.variant_name ? ` — ${i.variant_name}` : ""}
                      {i.personalization?.name ? <strong className="text-ink"> « {i.personalization.name} »</strong> : null}
                    </span>
                  ))}
                </span>
                <span className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
                  <Badge tone={PAYMENT_TONE[o.payment_status]}>{PAYMENT_LABELS[o.payment_status]}</Badge>
                  {o.payment_status === "paid" ? <Badge tone="info">{FULFILLMENT_LABELS[o.fulfillment_status]}</Badge> : null}
                  <span className="font-medium text-ink">{formatPrice(o.total_cents)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {pages > 1 ? (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-center gap-3 text-sm">
          {f.page > 1 ? <Link className={btnSecondary} href={`/admin/commandes?${new URLSearchParams({ ...Object.fromEntries(qs), page: String(f.page - 1) })}`}>← Précédentes</Link> : null}
          <span>Page {f.page} / {pages}</span>
          {f.page < pages ? <Link className={btnSecondary} href={`/admin/commandes?${new URLSearchParams({ ...Object.fromEntries(qs), page: String(f.page + 1) })}`}>Suivantes →</Link> : null}
        </nav>
      ) : null}
    </>
  );
}
