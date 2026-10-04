import Link from "next/link";
import { Badge, Card, Notice, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";
import { mergeSettings, SECTIONS } from "@/lib/content/sections";
import { isEmailConfigured, isStripeConfigured, paymentMode } from "@/lib/env";
import { formatDateTime, formatPrice } from "@/lib/format";
import { FULFILLMENT_LABELS, PAYMENT_LABELS, PAYMENT_TONE } from "@/lib/orders/labels";

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const db = admin.supabase;

  const [orders, commerceRow, placeholders, pages, zones, products] = await Promise.all([
    db
      .from("orders")
      .select("id, order_number, created_at, payment_status, fulfillment_status, total_cents, customer_name")
      .order("created_at", { ascending: false })
      .limit(8),
    db.from("site_settings").select("value").eq("key", "commerce").maybeSingle(),
    db.from("media").select("id", { count: "exact", head: true }).eq("is_placeholder", true),
    db.from("pages").select("slug, title, is_complete"),
    db.from("shipping_zones").select("id, name, price_cents, is_active"),
    db.from("products").select("id, status"),
  ]);

  const commerce = mergeSettings("commerce", commerceRow.data?.value ?? null);
  const commerceSection = SECTIONS.find((s) => s.key === "commerce")!;
  const missingCommerce = commerceSection.groups
    .flatMap((g) => g.fields)
    .filter((f) => f.required && !String(commerce[f.key as keyof typeof commerce] ?? "").trim())
    .map((f) => f.label);
  const incompletePages = (pages.data ?? []).filter((p) => !p.is_complete);
  const mode = paymentMode();
  const published = (products.data ?? []).filter((p) => p.status === "published").length;
  const drafts = (products.data ?? []).filter((p) => p.status === "draft").length;

  const checklist = [
    {
      done: isStripeConfigured(),
      label:
        mode === "live"
          ? "Paiement Stripe actif (mode réel)"
          : mode === "test"
            ? "Paiement Stripe configuré en mode test"
            : "Paiement Stripe à configurer",
      help: "Variables STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET (voir README).",
    },
    { done: isEmailConfigured(), label: "Envoi d’emails", help: "EMAIL_PROVIDER, EMAIL_FROM et la clé du prestataire." },
    {
      done: missingCommerce.length === 0,
      label: "Informations commerciales et légales",
      help: missingCommerce.length ? `À compléter : ${missingCommerce.join(", ")}.` : "",
      href: "/admin/contenus/commerce",
    },
    {
      done: incompletePages.length === 0,
      label: "Pages d’informations validées",
      help: incompletePages.length ? `À relire : ${incompletePages.map((p) => p.title).join(", ")}.` : "",
      href: "/admin/contenus",
    },
    {
      done: (placeholders.count ?? 0) === 0,
      label: "Photos définitives",
      help: placeholders.count
        ? `${placeholders.count} visuel(s) provisoire(s) issus des maquettes à remplacer par les photos originales.`
        : "",
      href: "/admin/medias?provisoires=1",
    },
    {
      done: (zones.data ?? []).some((z) => z.is_active),
      label: "Frais de livraison vérifiés",
      help: "Le tarif initial (4,90 € France) est indicatif : vérifiez-le.",
      href: "/admin/reglages",
    },
  ];

  return (
    <>
      <PageHeader title={`Bonjour ${admin.displayName} !`} description="Vue d’ensemble de la boutique." />
      {sp.ok === "mot-de-passe" ? (
        <div className="mb-4">
          <Notice tone="ok">Votre mot de passe a été modifié.</Notice>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card title="Dernières commandes" actions={<Link href="/admin/commandes" className="text-sm text-rose-text underline">Toutes les commandes</Link>}>
          {(orders.data ?? []).length === 0 ? (
            <p className="text-brown-soft">Aucune commande pour le moment.</p>
          ) : (
            <ul className="divide-y divide-line">
              {(orders.data ?? []).map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/commandes/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-ivory-deep/50">
                    <span>
                      <span className="font-medium text-ink">{o.order_number}</span>
                      <span className="ml-2 text-sm text-brown-soft">{o.customer_name ?? "—"}</span>
                      <span className="block text-xs text-brown-soft">{formatDateTime(o.created_at)}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge tone={PAYMENT_TONE[o.payment_status]}>{PAYMENT_LABELS[o.payment_status]}</Badge>
                      {o.payment_status === "paid" ? <Badge tone="info">{FULFILLMENT_LABELS[o.fulfillment_status]}</Badge> : null}
                      <span className="text-sm font-medium text-ink">{formatPrice(o.total_cents)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Avant l’ouverture">
            <ul className="space-y-3">
              {checklist.map((c) => (
                <li key={c.label} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white ${c.done ? "bg-success" : "bg-warning"}`}
                  >
                    {c.done ? "✓" : "!"}
                  </span>
                  <div className="text-sm">
                    <p className="font-medium text-ink">
                      {c.href ? (
                        <Link href={c.href} className="underline underline-offset-2 hover:text-rose-text">
                          {c.label}
                        </Link>
                      ) : (
                        c.label
                      )}
                      <span className="visually-hidden">{c.done ? " : fait" : " : à faire"}</span>
                    </p>
                    {!c.done && c.help ? <p className="text-brown-soft">{c.help}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Catalogue">
            <p className="text-sm">
              {published} produit(s) publié(s), {drafts} brouillon(s).{" "}
              <Link href="/admin/produits/nouveau" className="text-rose-text underline">
                Ajouter un produit
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
