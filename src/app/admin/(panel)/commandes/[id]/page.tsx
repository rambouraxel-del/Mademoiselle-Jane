import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resendConfirmation } from "@/app/admin/actions/orders";
import { ConfirmAction } from "@/components/admin/forms";
import { OrderFulfillmentForm } from "@/components/admin/order-fulfillment-form";
import { Badge, Card, Notice, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";
import { countryName, formatDateTime, formatPrice } from "@/lib/format";
import { FULFILLMENT_LABELS, PAYMENT_LABELS, PAYMENT_TONE } from "@/lib/orders/labels";

export const metadata: Metadata = { title: "Commande" };

export default async function OrderDetailPage({ params }: PageProps<"/admin/commandes/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: o } = await admin.supabase.from("orders").select("*, order_items (*)").eq("id", id).maybeSingle();
  if (!o) notFound();
  const address = (o.shipping_address ?? null) as Record<string, string | null> | null;
  const paid = o.payment_status === "paid";

  return (
    <>
      <PageHeader title={`Commande ${o.order_number}`} back={{ href: "/admin/commandes", label: "Commandes" }} description={`Passée le ${formatDateTime(o.created_at)}`} />
      <div className="mb-5 flex flex-wrap gap-2">
        <Badge tone={PAYMENT_TONE[o.payment_status]}>Paiement : {PAYMENT_LABELS[o.payment_status]}</Badge>
        <Badge tone="info">Préparation : {FULFILLMENT_LABELS[o.fulfillment_status]}</Badge>
      </div>
      {o.payment_status === "review" ? (
        <div className="mb-4"><Notice tone="error">Le montant reçu par Stripe ne correspond pas au total attendu. Vérifiez le paiement dans le tableau de bord Stripe avant de fabriquer.</Notice></div>
      ) : null}
      {!paid && o.payment_status !== "review" ? (
        <div className="mb-4"><Notice tone="warning">Commande non payée : ne pas fabriquer. Le paiement est confirmé uniquement par Stripe.</Notice></div>
      ) : null}
      {o.last_email_error ? <div className="mb-4"><Notice tone="warning">Dernier envoi d’email en échec : {o.last_email_error}</Notice></div> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card title="Médailles à réaliser">
            <ul className="divide-y divide-line">
              {o.order_items.map((item) => {
                const p = (item.personalization ?? {}) as { name?: string; phone?: string };
                return (
                  <li key={item.id} className="py-3">
                    <div className="flex justify-between gap-3">
                      <p className="font-medium text-ink">
                        {item.quantity} × {item.product_name}
                        {item.variant_name ? ` — ${item.variant_name}` : ""}
                        {item.size_label ? ` (${item.size_label})` : ""}
                      </p>
                      <p className="whitespace-nowrap">{formatPrice(item.line_total_cents)}</p>
                    </div>
                    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                      <dt className="text-brown-soft">Prénom</dt>
                      <dd className="text-lg font-semibold tracking-wide text-ink">{p.name ?? "—"}</dd>
                      <dt className="text-brown-soft">Téléphone au dos</dt>
                      <dd className="text-ink">{p.phone ?? "—"}</dd>
                      <dt className="text-brown-soft">Prix unitaire</dt>
                      <dd>{formatPrice(item.unit_price_cents)}</dd>
                    </dl>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
              <div className="flex justify-between"><dt>Sous-total</dt><dd>{formatPrice(o.subtotal_cents)}</dd></div>
              <div className="flex justify-between"><dt>Livraison ({o.shipping_zone_name})</dt><dd>{formatPrice(o.shipping_cents)}</dd></div>
              <div className="flex justify-between font-medium text-ink"><dt>Total</dt><dd>{formatPrice(o.total_cents)}</dd></div>
              {o.amount_received_cents !== null ? (
                <div className="flex justify-between text-brown-soft"><dt>Montant reçu (Stripe)</dt><dd>{formatPrice(o.amount_received_cents)}</dd></div>
              ) : null}
            </dl>
          </Card>
          <Card title="Préparation et expédition">
            <OrderFulfillmentForm
              order={{
                id: o.id,
                fulfillmentStatus: o.fulfillment_status,
                carrier: o.carrier,
                trackingNumber: o.tracking_number,
                trackingUrl: o.tracking_url,
                internalNote: o.internal_note,
                paid,
                shippingEmailSent: Boolean(o.shipping_email_sent_at),
              }}
            />
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Client et livraison">
            {o.customer_email ? (
              <dl className="space-y-2 text-sm">
                <div><dt className="text-brown-soft">Nom</dt><dd className="text-ink">{o.customer_name ?? "—"}</dd></div>
                <div><dt className="text-brown-soft">Email</dt><dd><a className="text-rose-text underline" href={`mailto:${o.customer_email}`}>{o.customer_email}</a></dd></div>
                <div><dt className="text-brown-soft">Téléphone</dt><dd className="text-ink">{o.customer_phone ?? "—"}</dd></div>
                <div>
                  <dt className="text-brown-soft">Adresse de livraison</dt>
                  <dd className="whitespace-pre-line text-ink">
                    {address
                      ? [o.customer_name, address.line1, address.line2, `${address.postal_code ?? ""} ${address.city ?? ""}`.trim(), address.state, address.country ? countryName(address.country) : null]
                          .filter(Boolean)
                          .join("\n")
                      : "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-brown-soft">Coordonnées renseignées par le client lors du paiement Stripe (pas encore reçues).</p>
            )}
          </Card>
          <Card title="Emails">
            <ul className="space-y-1 text-sm">
              <li>Confirmation : {o.confirmation_email_sent_at ? `envoyée le ${formatDateTime(o.confirmation_email_sent_at)}` : "non envoyée"}</li>
              <li>Expédition : {o.shipping_email_sent_at ? `envoyée le ${formatDateTime(o.shipping_email_sent_at)}` : "non envoyée"}</li>
            </ul>
            {paid && !o.confirmation_email_sent_at ? (
              <div className="mt-3">
                <ConfirmAction
                  action={resendConfirmation}
                  fields={{ id: o.id }}
                  danger={false}
                  label="Envoyer l’email de confirmation"
                  confirmTitle="Envoyer la confirmation ?"
                  confirmText="Le client recevra le récapitulatif de sa commande."
                  confirmLabel="Envoyer"
                />
              </div>
            ) : null}
          </Card>
          <Card title="Paiement Stripe">
            <dl className="space-y-1 break-all text-xs text-brown">
              <div><dt className="inline text-brown-soft">Session : </dt><dd className="inline">{o.stripe_session_id ?? "—"}</dd></div>
              <div><dt className="inline text-brown-soft">Paiement : </dt><dd className="inline">{o.stripe_payment_intent_id ?? "—"}</dd></div>
              <div><dt className="inline text-brown-soft">Payée le : </dt><dd className="inline">{o.paid_at ? formatDateTime(o.paid_at) : "—"}</dd></div>
            </dl>
            <p className="mt-2 text-xs text-brown-soft">Les remboursements se font depuis le tableau de bord Stripe ; la commande est mise à jour automatiquement.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
