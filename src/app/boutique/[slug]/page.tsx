import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductBySlug } from "@/services/products";
import { getAllProducts } from "@/data/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCustomizer } from "@/components/product/ProductCustomizer";

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Médaille introuvable" };
  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="container-site py-12 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery shape={product.shape} colors={product.colors} captions={product.images} />
        <ProductCustomizer product={product} />
      </div>
    </div>
  );
}
