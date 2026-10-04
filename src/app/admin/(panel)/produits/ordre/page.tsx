import type { Metadata } from "next";
import { reorderProducts } from "@/app/admin/actions/products";
import { ReorderList } from "@/components/admin/reorder-list";
import { Card, PageHeader } from "@/components/admin/ui";
import { adminGetProducts } from "@/lib/admin/products";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Ordre d’affichage" };

async function saveShopOrder(ids: string[]) {
  "use server";
  return reorderProducts(ids, "sort_order");
}
async function saveFeaturedOrder(ids: string[]) {
  "use server";
  return reorderProducts(ids, "featured_order");
}

export default async function OrderPage() {
  const admin = await requireAdmin();
  const products = (await adminGetProducts(admin)).filter((p) => p.status !== "archived");
  const featured = products
    .filter((p) => p.isFeatured)
    .sort((a, b) => a.featuredOrder - b.featuredOrder || a.sortOrder - b.sortOrder);
  const toItem = (p: (typeof products)[number]) => ({
    id: p.id,
    label: p.name,
    sublabel: p.status === "published" ? "Publié" : "Brouillon",
    imageUrl: p.images[0]?.media.url ?? null,
  });

  return (
    <>
      <PageHeader title="Ordre d’affichage" back={{ href: "/admin/produits", label: "Produits" }} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Boutique (Les médailles)">
          <p className="mb-3 text-sm text-brown-soft">Ordre des produits dans la boutique (chaque finition apparaît sur sa ligne).</p>
          <ReorderList items={products.map(toItem)} onSave={saveShopOrder} />
        </Card>
        <Card title="Accueil (coups de cœur)">
          <p className="mb-3 text-sm text-brown-soft">Pour ajouter ou retirer un produit, cochez « Mettre en avant » dans sa fiche.</p>
          {featured.length ? <ReorderList items={featured.map(toItem)} onSave={saveFeaturedOrder} /> : <p className="text-sm">Aucun produit mis en avant.</p>}
        </Card>
      </div>
    </>
  );
}
