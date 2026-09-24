import { fetchFeaturedProducts } from "@/services/products";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/ButtonLink";

export async function FeaturedProducts() {
  const products = await fetchFeaturedProducts(4);

  return (
    <section className="container-site py-16 sm:py-20">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Sélection"
          title="Nos médailles les plus demandées"
          description="Un aperçu de notre collection. Chaque modèle se personnalise entièrement sur sa fiche produit."
        />
        <ButtonLink href="/boutique" variant="outline" className="shrink-0">
          Voir toute la boutique
        </ButtonLink>
      </div>

      {products.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">
          Aucune médaille en avant en ce moment — la collection complète reste disponible en boutique.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
