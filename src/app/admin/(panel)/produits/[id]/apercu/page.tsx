import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPageBody } from "@/components/product/product-page";
import { adminGetProduct } from "@/lib/admin/products";
import { requireAdmin } from "@/lib/auth/admin";
import { getSettings, resolveImages } from "@/lib/content/queries";

export const metadata: Metadata = { title: "Aperçu privé", robots: { index: false, follow: false } };

/** Aperçu réservé aux administrateurs, y compris pour un brouillon. */
export default async function PreviewPage({ params }: PageProps<"/admin/produits/[id]/apercu">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const product = await adminGetProduct(admin, id);
  if (!product) notFound();
  const settings = await getSettings();
  const images = await resolveImages([settings.product_page.details_image]);
  return (
    <div className="-mx-4 -my-6 bg-ivory sm:-mx-6 lg:-mx-10 lg:-my-8">
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 bg-ink px-4 py-2 text-sm text-white">
        <span>Aperçu privé — {product.status === "published" ? "produit publié" : "non visible par le public"}</span>
        <Link href={`/admin/produits/${product.id}`} className="underline">Revenir à la modification</Link>
      </div>
      <ProductPageBody
        product={product}
        initialVariantId={product.variants.find((v) => v.isActive)?.id ?? null}
        settings={settings}
        related={[]}
        detailsImage={images[settings.product_page.details_image] ?? null}
        preview
      />
    </div>
  );
}
