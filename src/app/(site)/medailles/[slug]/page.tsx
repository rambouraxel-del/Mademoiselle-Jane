import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageBody } from "@/components/product/product-page";
import { activeVariants, imageForVariant, isProductAvailable } from "@/lib/catalog/map";
import { getPublishedProductBySlug, getPublishedProducts } from "@/lib/catalog/queries";
import type { Product } from "@/lib/catalog/types";
import { getSettings, resolveImages } from "@/lib/content/queries";

function pickVariant(product: Product, finition: string | undefined): string | null {
  const variants = activeVariants(product);
  if (finition) {
    const match = variants.find((v) => v.finish === finition || v.id === finition);
    if (match) return match.id;
  }
  return variants[0]?.id ?? null;
}

export async function generateMetadata({ params }: PageProps<"/medailles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) return { title: "Médaille introuvable" };
  const image = product.images[0];
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription,
    alternates: { canonical: `/medailles/${product.slug}` },
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.shortDescription,
      images: image ? [{ url: image.media.url, width: image.media.width, height: image.media.height, alt: image.alt }] : [],
    },
  };
}

export default async function ProductPage({ params, searchParams }: PageProps<"/medailles/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const product = await getPublishedProductBySlug(slug);
  if (!product) notFound();

  const [settings, all] = await Promise.all([getSettings(), getPublishedProducts()]);
  const images = await resolveImages([settings.product_page.details_image]);
  const finition = typeof sp.finition === "string" ? sp.finition : undefined;
  const related = all.filter((p) => p.id !== product.id).slice(0, 2);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

  // Données structurées (schema.org) cohérentes avec la page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images.map((i) => i.media.url),
    material: product.material || undefined,
    brand: { "@type": "Brand", name: "Mademoizelle Jane" },
    url: `${siteUrl}/medailles/${product.slug}`,
    offers: activeVariants(product).length
      ? activeVariants(product).map((v) => ({
          "@type": "Offer",
          name: `${product.name} — ${v.name}`,
          sku: v.sku || undefined,
          price: (v.priceCents / 100).toFixed(2),
          priceCurrency: "EUR",
          availability: v.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: `${siteUrl}/medailles/${product.slug}?finition=${encodeURIComponent(v.finish || v.id)}`,
          image: imageForVariant(product, v.id)?.media.url,
        }))
      : {
          "@type": "Offer",
          price: (product.basePriceCents / 100).toFixed(2),
          priceCurrency: "EUR",
          availability: isProductAvailable(product) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON sérialisé et protégé contre la fermeture de balise
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductPageBody
        product={product}
        initialVariantId={pickVariant(product, finition)}
        settings={settings}
        related={related}
        detailsImage={images[settings.product_page.details_image] ?? null}
      />
    </>
  );
}
