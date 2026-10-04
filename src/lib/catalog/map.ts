import type { Database } from "@/lib/supabase/database.types";
import { publicMediaUrl } from "@/lib/media/url";
import type { Collection, MediaRef, Product, ProductImage, ShopCard, Variant } from "./types";

type Tables = Database["public"]["Tables"];
export type MediaRow = Tables["media"]["Row"];
type ProductRow = Tables["products"]["Row"];
type VariantRow = Tables["product_variants"]["Row"];
type ImageRow = Tables["product_images"]["Row"] & { media: MediaRow | null };
type CollectionLinkRow = {
  sort_order: number;
  collections: Pick<Tables["collections"]["Row"], "id" | "slug" | "name" | "is_published"> | null;
};

export type ProductQueryRow = ProductRow & {
  product_variants: VariantRow[] | null;
  product_images: ImageRow[] | null;
  product_collections: CollectionLinkRow[] | null;
  story_image: MediaRow | null;
};

/** Sélection Supabase commune (public et administration). */
export const PRODUCT_SELECT = `
  *,
  product_variants (*),
  product_images (*, media (*)),
  product_collections (sort_order, collections (id, slug, name, is_published)),
  story_image:media!products_story_image_id_fkey (*)
`;

export function mapMedia(row: MediaRow | null | undefined): MediaRef | null {
  if (!row) return null;
  return {
    id: row.id,
    path: row.path,
    url: publicMediaUrl(row.path, row.bucket),
    width: row.width,
    height: row.height,
    alt: row.alt,
    focalX: row.focal_x,
    focalY: row.focal_y,
    isPlaceholder: row.is_placeholder,
  };
}

export function mapProduct(row: ProductQueryRow): Product {
  const variants: Variant[] = (row.product_variants ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .map((v) => {
      const inStock = row.stock_mode === "made_to_order" || (v.stock_quantity ?? 0) > 0;
      return {
        id: v.id,
        name: v.name,
        finish: v.finish,
        swatch: v.swatch,
        priceCents: v.price_cents ?? row.base_price_cents,
        stockQuantity: v.stock_quantity,
        isActive: v.is_active,
        sortOrder: v.sort_order,
        sku: v.sku,
        available: row.is_available && v.is_active && inStock,
      };
    });

  const images: ProductImage[] = (row.product_images ?? [])
    .filter((i) => i.media)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => {
      const media = mapMedia(i.media)!;
      return {
        id: i.id,
        media,
        variantId: i.variant_id,
        alt: i.alt_override || media.alt || row.name,
        sortOrder: i.sort_order,
      };
    });

  const collections = (row.product_collections ?? [])
    .filter((c) => c.collections)
    .map((c) => ({
      id: c.collections!.id,
      slug: c.collections!.slug,
      name: c.collections!.name,
      sortOrder: c.sort_order,
      isPublished: c.collections!.is_published,
    }))
    .filter((c) => c.isPublished)
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name, sortOrder: c.sortOrder }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    status: row.status,
    basePriceCents: row.base_price_cents,
    shape: row.shape,
    sizeLabel: row.size_label,
    material: row.material,
    dimensions: row.dimensions,
    careInfo: row.care_info,
    personalizationInfo: row.personalization_info,
    fabricationDelay: row.fabrication_delay,
    stockMode: row.stock_mode,
    isAvailable: row.is_available,
    sortOrder: row.sort_order,
    isFeatured: row.is_featured,
    featuredOrder: row.featured_order,
    personalization: {
      name: { enabled: row.name_enabled, required: row.name_required, maxLength: row.name_max_length },
      phone: { enabled: row.phone_enabled, required: row.phone_required, maxLength: row.phone_max_length },
    },
    storyTitle: row.story_title,
    storyText: row.story_text,
    storyImage: mapMedia(row.story_image),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    variants,
    images,
    collections,
    updatedAt: row.updated_at,
  };
}

export function mapCollection(
  row: Tables["collections"]["Row"] & { image?: MediaRow | null },
): Collection {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: mapMedia(row.image ?? null),
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

/** Photo principale pour une variante : d'abord une photo liée à la variante, sinon la première photo. */
export function imageForVariant(product: Product, variantId: string | null): ProductImage | null {
  if (variantId) {
    const own = product.images.find((i) => i.variantId === variantId);
    if (own) return own;
  }
  return product.images.find((i) => !i.variantId) ?? product.images[0] ?? null;
}

/** Photos à afficher sur la fiche : celles de la variante en premier, puis les photos communes, puis les autres. */
export function galleryForVariant(product: Product, variantId: string | null): ProductImage[] {
  const own = product.images.filter((i) => variantId && i.variantId === variantId);
  const common = product.images.filter((i) => !i.variantId);
  const others = product.images.filter((i) => i.variantId && i.variantId !== variantId);
  return [...own, ...common, ...others];
}

export function activeVariants(product: Product): Variant[] {
  return product.variants.filter((v) => v.isActive);
}

export function priceRange(product: Product): { min: number; max: number } {
  const prices = activeVariants(product).map((v) => v.priceCents);
  if (prices.length === 0) return { min: product.basePriceCents, max: product.basePriceCents };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function isProductAvailable(product: Product): boolean {
  if (!product.isAvailable) return false;
  const variants = activeVariants(product);
  if (variants.length === 0) return product.stockMode === "made_to_order";
  return variants.some((v) => v.available);
}

export function shopCards(products: Product[], perVariant = true): ShopCard[] {
  const cards: ShopCard[] = [];
  for (const product of products) {
    const variants = activeVariants(product);
    if (!perVariant || variants.length === 0) {
      const v = variants[0] ?? null;
      cards.push({
        key: product.id,
        product,
        variant: v,
        title: product.name,
        priceCents: v ? priceRange(product).min : product.basePriceCents,
        image: imageForVariant(product, v?.id ?? null),
        href: `/medailles/${product.slug}`,
        available: isProductAvailable(product),
      });
      continue;
    }
    for (const v of variants) {
      cards.push({
        key: `${product.id}:${v.id}`,
        product,
        variant: v,
        title: `${product.name} — ${v.name}`,
        priceCents: v.priceCents,
        image: imageForVariant(product, v.id),
        href: `/medailles/${product.slug}?finition=${encodeURIComponent(v.finish || v.id)}`,
        available: v.available,
      });
    }
  }
  return cards;
}
