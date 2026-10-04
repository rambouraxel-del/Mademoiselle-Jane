import Link from "next/link";
import { ArrowRightIcon, ChevronDownIcon, ChevronRightIcon } from "@/components/icons";
import { MediaImage } from "@/components/media-image";
import { DoodleHeart } from "@/components/site/decor";
import { TextLines } from "@/components/site/text-lines";
import { imageForVariant, priceRange } from "@/lib/catalog/map";
import type { MediaRef, Product } from "@/lib/catalog/types";
import type { AllSettings } from "@/lib/content/sections";
import { formatPrice } from "@/lib/format";
import { ProductView } from "./product-view";

function Accordion({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group border-b border-brown/25" open={defaultOpen}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[1.05rem] text-ink marker:hidden hover:text-rose-text [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDownIcon size={20} className="shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-4 text-[0.95rem] leading-relaxed text-brown">{children}</div>
    </details>
  );
}

export function ProductPageBody({
  product,
  initialVariantId,
  settings,
  related,
  detailsImage,
  preview,
}: {
  product: Product;
  initialVariantId: string | null;
  settings: AllSettings;
  related: Product[];
  detailsImage: MediaRef | null;
  preview?: boolean;
}) {
  const pp = settings.product_page;
  const fabricationDelay = product.fabricationDelay || settings.commerce.default_fabrication_delay;
  const storyTitle = product.storyTitle || pp.details_title;
  const storyText = product.storyText || pp.details_text;
  const storyImage = product.storyImage ?? detailsImage;
  const details = [product.material, product.dimensions].filter(Boolean);

  return (
    <>
      <div className="container-site pb-14 pt-5">
        <nav aria-label="Fil d’Ariane" className="mb-5 text-[0.8125rem] text-brown-soft">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-rose-text">
                Accueil
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRightIcon size={14} />
            </li>
            <li>
              <Link href="/medailles" className="hover:text-rose-text">
                Les médailles
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRightIcon size={14} />
            </li>
            <li aria-current="page" className="text-ink">
              {product.name}
            </li>
          </ol>
        </nav>
        <ProductView
          product={product}
          initialVariantId={initialVariantId}
          notice={pp.personalization_notice}
          fabricationDelay={fabricationDelay}
          preview={preview}
        />
      </div>

      {/* Les petits détails */}
      <section className="bg-blush">
        <div className="container-site grid gap-8 py-8 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,0.78fr)_minmax(0,0.75fr)] lg:items-center lg:gap-10">
          <div className="relative aspect-[285/211] overflow-hidden rounded-[2px] bg-beige">
            <MediaImage media={storyImage} sizes="(min-width: 1024px) 28vw, 100vw" />
          </div>
          <div>
            <h2 className="text-[2rem] leading-[1.1] lg:text-[2.35rem]">
              <TextLines text={storyTitle} />
            </h2>
            <DoodleHeart size={22} className="mt-2" />
            <p className="mt-3 font-serif text-[1.08rem] leading-snug text-brown">
              <TextLines text={storyText} />
            </p>
          </div>
          <div className="border-t border-brown/25">
            <Accordion title="Détails du produit" defaultOpen>
              {details.length > 0 ? <p>{details.join(" • ")}</p> : null}
              {product.description ? (
                <p className={details.length > 0 ? "mt-2" : ""}>
                  <TextLines text={product.description} />
                </p>
              ) : null}
              {fabricationDelay ? <p className="mt-2">Délai de fabrication indicatif : {fabricationDelay}</p> : null}
            </Accordion>
            <Accordion title="Personnalisation">
              {product.personalizationInfo ? (
                <p>
                  <TextLines text={product.personalizationInfo} />
                </p>
              ) : (
                <p>Cette médaille n’est pas personnalisable.</p>
              )}
            </Accordion>
            <Accordion title="Entretien">
              {product.careInfo ? (
                <p>
                  <TextLines text={product.careInfo} />
                </p>
              ) : null}
              <p className="mt-2">
                <Link href="/infos/entretien" className="underline underline-offset-2 hover:text-rose-text">
                  Tous nos conseils d’entretien
                </Link>
              </p>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Vous aimerez aussi */}
      {related.length > 0 ? (
        <section className="container-site py-8 lg:py-9" aria-labelledby="suggestions">
          <div className="flex items-center justify-between gap-4 sm:px-6">
            <h2 id="suggestions" className="text-[1.75rem] lg:text-[2rem]">
              {pp.related_title}
            </h2>
            <Link href="/medailles" className="inline-flex items-center gap-2 text-[0.95rem] text-brown hover:text-rose-text">
              Voir toute la collection <ArrowRightIcon size={20} />
            </Link>
          </div>
          <ul className="mt-4 grid gap-6 sm:px-6 md:grid-cols-2 md:gap-12">
            {related.map((p) => {
              const img = p.images[0] ?? imageForVariant(p, null);
              const range = priceRange(p);
              return (
                <li key={p.id} className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] items-center gap-6">
                  <div className="relative aspect-[213/152] overflow-hidden rounded-[2px] bg-beige">
                    <MediaImage media={img?.media} alt={img?.alt ?? p.name} sizes="(min-width: 768px) 20vw, 45vw" />
                  </div>
                  <div>
                    <h3 className="text-[1.35rem]">{p.name}</h3>
                    <p className="mt-1 font-serif text-[1.35rem] text-ink">
                      {range.min !== range.max ? "À partir de " : ""}
                      {formatPrice(range.min)}
                    </p>
                    <Link href={`/medailles/${p.slug}`} className="btn btn-primary mt-3 !px-10 !py-2 !text-[0.95rem]">
                      Voir le produit
                      <span className="visually-hidden"> {p.name}</span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </>
  );
}
