import { DEFAULTS, mergeSettings, type AllSettings, type SettingsKey } from "@/lib/content/sections";
import type { FaqItem, InfoPage, ShippingZone } from "@/lib/content/queries";
import type { Collection, MediaRef, Product, ProductImage, Variant } from "@/lib/catalog/types";
import {
  SEED_COLLECTION,
  SEED_FAQ,
  SEED_MEDIA,
  SEED_PAGES,
  SEED_PRODUCTS,
  SEED_SHIPPING_ZONES,
} from "@/lib/seed/content";

/**
 * Données du mode aperçu (PREVIEW_MODE=true) : exactement les données
 * initiales chargées par « npm run seed », mais lues localement, avec les
 * visuels servis depuis public/media-initiales. Aucun service externe.
 */

/** Dimensions réelles des fichiers de public/media-initiales. */
const DIMENSIONS: Record<string, [number, number]> = {
  "accueil-atelier.jpg": [628, 212],
  "accueil-hero.jpg": [686, 440],
  "coeur-ovale-argente-grille.jpg": [325, 289],
  "coeur-ovale-dore-grille.jpg": [325, 286],
  "coeur-rond-argente-grille.jpg": [325, 289],
  "coeur-rond-dore-grille.jpg": [325, 286],
  "coeur-rond-dore.jpg": [496, 570],
  "fleur-amour-argentee.jpg": [560, 475],
  "fleur-amour-doree-grille.jpg": [323, 286],
  "fleur-amour-gros-plan.jpg": [284, 211],
  "histoire-hero.jpg": [581, 451],
  "histoire-mains.jpg": [525, 370],
};

/** Identifiants stables au format UUID (les validations du panier les exigent). */
function uuid(group: number, index: number): string {
  return `00000000-0000-4000-8${String(group).padStart(3, "0")}-${String(index).padStart(12, "0")}`;
}

const mediaKeys = Object.keys(SEED_MEDIA);
const MEDIA: Record<string, MediaRef> = Object.fromEntries(
  mediaKeys.map((key, i) => {
    const def = SEED_MEDIA[key];
    const [width, height] = DIMENSIONS[def.file] ?? [800, 600];
    return [
      key,
      {
        id: uuid(1, i + 1),
        path: `media-initiales/${def.file}`,
        url: `/media-initiales/${def.file}`,
        width,
        height,
        alt: def.alt,
        focalX: 50,
        focalY: 50,
        isPlaceholder: true,
      } satisfies MediaRef,
    ];
  }),
);
const MEDIA_BY_ID: Record<string, MediaRef> = Object.fromEntries(Object.values(MEDIA).map((m) => [m.id, m]));

const COLLECTION: Collection = {
  id: uuid(2, 1),
  slug: SEED_COLLECTION.slug,
  name: SEED_COLLECTION.name,
  description: SEED_COLLECTION.description,
  image: MEDIA[SEED_COLLECTION.image] ?? null,
  sortOrder: 1,
  isPublished: true,
  seoTitle: "",
  seoDescription: "",
};

const PRODUCTS: Product[] = SEED_PRODUCTS.map((p, pi) => {
  const variants: Variant[] = [];
  const images: ProductImage[] = [];
  let order = 10;
  p.variants.forEach((v, vi) => {
    const variantId = uuid(10 + pi, vi + 1);
    variants.push({
      id: variantId,
      name: v.name,
      finish: v.finish,
      swatch: v.swatch,
      priceCents: p.base_price_cents,
      stockQuantity: null,
      isActive: true,
      sortOrder: vi + 1,
      sku: `${p.slug}-${v.finish}`.toUpperCase(),
      available: true,
    });
    for (const key of v.images) {
      const media = MEDIA[key];
      if (!media) continue;
      const first = "imageFirst" in v && v.imageFirst;
      images.push({ id: uuid(20 + pi, images.length + 1), media, variantId, alt: media.alt, sortOrder: first ? 0 : order++ });
    }
  });
  images.sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: uuid(3, pi + 1),
    slug: p.slug,
    name: p.name,
    shortDescription: p.short_description,
    description: p.description,
    status: "published",
    basePriceCents: p.base_price_cents,
    shape: p.shape,
    sizeLabel: p.size_label,
    material: p.material,
    dimensions: p.dimensions,
    careInfo: p.care_info,
    personalizationInfo: p.personalization_info,
    fabricationDelay: "",
    stockMode: "made_to_order",
    isAvailable: true,
    sortOrder: p.sort_order,
    isFeatured: true,
    featuredOrder: p.featured_order,
    personalization: {
      name: { enabled: true, required: true, maxLength: 12 },
      phone: { enabled: true, required: false, maxLength: 20 },
    },
    storyTitle: "",
    storyText: "",
    storyImage: p.story_image ? (MEDIA[p.story_image] ?? null) : null,
    seoTitle: "",
    seoDescription: "",
    variants,
    images,
    collections: [{ id: COLLECTION.id, slug: COLLECTION.slug, name: COLLECTION.name, sortOrder: p.sort_order }],
    updatedAt: "2026-10-04T00:00:00.000Z",
  } satisfies Product;
});

/** Images des contenus : mêmes associations que le script de données initiales. */
const SETTINGS_IMAGES: Partial<Record<SettingsKey, Record<string, string>>> = {
  home: { hero_image: MEDIA["accueil-hero"].id, story_image: MEDIA["accueil-atelier"].id },
  story: { hero_image: MEDIA["histoire-hero"].id, section_image: MEDIA["histoire-mains"].id },
  product_page: { details_image: MEDIA["fleur-amour-gros-plan"].id },
};

export function previewSettings(): AllSettings {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(DEFAULTS) as SettingsKey[]) {
    out[key] = mergeSettings(key, { ...DEFAULTS[key], ...(SETTINGS_IMAGES[key] ?? {}) });
  }
  return out as AllSettings;
}

export function previewProducts(): Product[] {
  return PRODUCTS;
}

export function previewCollections(): Collection[] {
  return [COLLECTION];
}

export function previewMedia(ids: string[]): Record<string, MediaRef> {
  const out: Record<string, MediaRef> = {};
  for (const id of ids) if (MEDIA_BY_ID[id]) out[id] = MEDIA_BY_ID[id];
  return out;
}

export function previewFaq(): FaqItem[] {
  return SEED_FAQ.map((f, i) => ({ id: uuid(4, i + 1), question: f.question, answer: f.answer }));
}

export function previewPages(): InfoPage[] {
  return SEED_PAGES.map((p) => ({
    slug: p.slug,
    title: p.title,
    body: p.body,
    isComplete: false,
    seoDescription: p.seo_description,
  }));
}

export function previewShippingZones(): ShippingZone[] {
  return SEED_SHIPPING_ZONES.map((z, i) => ({
    id: uuid(5, i + 1),
    name: z.name,
    countries: z.countries,
    priceCents: z.price_cents,
    freeFromCents: z.free_from_cents,
    delayText: z.delay_text,
  }));
}
