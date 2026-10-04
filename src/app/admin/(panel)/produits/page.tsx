import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge, EmptyState, PageHeader, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { adminGetProducts } from "@/lib/admin/products";
import { requireAdmin } from "@/lib/auth/admin";
import { priceRange } from "@/lib/catalog/map";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Produits" };

const STATUS = {
  published: { label: "Publié", tone: "ok" },
  draft: { label: "Brouillon", tone: "wait" },
  archived: { label: "Archivé", tone: "neutral" },
} as const;

export default async function ProductsPage({ searchParams }: PageProps<"/admin/produits">) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const filter = typeof sp.statut === "string" ? sp.statut : "actifs";
  const all = await adminGetProducts(admin);
  const products = all.filter((p) => (filter === "tous" ? true : filter === "actifs" ? p.status !== "archived" : p.status === filter));
  const tabs = [
    ["actifs", "En cours"],
    ["published", "Publiés"],
    ["draft", "Brouillons"],
    ["archived", "Archivés"],
    ["tous", "Tous"],
  ] as const;

  return (
    <>
      <PageHeader
        title="Produits"
        description="Créez, modifiez et publiez vos médailles. Un brouillon reste invisible sur le site."
        actions={
          <>
            <Link href="/admin/produits/ordre" className={btnSecondary}>Ordre d’affichage</Link>
            <Link href="/admin/produits/nouveau" className={btnPrimary}>+ Nouveau produit</Link>
          </>
        }
      />
      <nav aria-label="Filtrer" className="mb-4 flex flex-wrap gap-2">
        {tabs.map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/produits?statut=${value}`}
            aria-current={filter === value ? "page" : undefined}
            className={`rounded-full border px-3 py-1 text-sm ${filter === value ? "border-rose bg-rose text-white" : "border-line-strong bg-white text-ink"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {products.length === 0 ? (
        <EmptyState>Aucun produit dans cette catégorie.</EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white">
          {products.map((p) => {
            const range = priceRange(p);
            const img = p.images[0];
            return (
              <li key={p.id}>
                <Link href={`/admin/produits/${p.id}`} className="flex items-center gap-4 p-3 hover:bg-ivory/60">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-ivory">
                    {img ? <Image src={img.media.url} alt="" fill sizes="64px" className="object-cover" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">{p.name}</span>
                    <span className="block text-sm text-brown-soft">
                      {p.variants.filter((v) => v.isActive).map((v) => v.name).join(" · ") || "Sans finition"} —{" "}
                      {range.min === range.max ? formatPrice(range.min) : `${formatPrice(range.min)} à ${formatPrice(range.max)}`}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>
                    {p.isFeatured ? <Badge tone="info">Coup de cœur</Badge> : null}
                    {!p.isAvailable ? <Badge tone="bad">Indisponible</Badge> : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
