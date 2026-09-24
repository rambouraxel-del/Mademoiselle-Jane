import type { Metadata } from "next";
import { fetchProducts } from "@/services/products";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopFilters, type ShopSearchParams } from "@/components/shop/ShopFilters";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { ProductRange, ProductShape } from "@/types";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Découvrez toutes nos médailles pour chiens en résine époxy : ronde, cœur, os ou patte, à personnaliser entièrement.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const products = await fetchProducts({
    shape: resolvedSearchParams.shape as ProductShape | undefined,
    color: resolvedSearchParams.color,
    range: resolvedSearchParams.range as ProductRange | undefined,
    maxPriceCents: resolvedSearchParams.price
      ? Number(resolvedSearchParams.price) * 100
      : undefined,
  });

  return (
    <div className="container-site py-12 sm:py-16">
      <div className="flex flex-col gap-2 pb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Boutique</span>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Toutes nos médailles</h1>
        <p className="max-w-xl text-ink-soft">
          Chaque modèle se personnalise entièrement sur sa fiche produit : couleur, effets,
          inscriptions et accessoires.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ShopFilters searchParams={resolvedSearchParams} />
        </aside>

        <div>
          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border py-20 text-center">
              <p className="text-ink-soft">
                Aucune médaille ne correspond à ces filtres pour le moment.
              </p>
              <ButtonLink href="/boutique" variant="outline">
                Réinitialiser les filtres
              </ButtonLink>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
