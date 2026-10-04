import { shopCards } from "./map";
import type { Product, ShopCard } from "./types";

export type ShopFilters = {
  forme: string;
  finition: string;
  collection: string;
  tri: string;
  q: string;
};

export const SORT_OPTIONS = [
  { value: "", label: "Notre sélection" },
  { value: "prix-croissant", label: "Prix croissant" },
  { value: "prix-decroissant", label: "Prix décroissant" },
  { value: "nom", label: "Nom (A → Z)" },
] as const;

export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe")
    .toLowerCase()
    .trim();
}

export function pluralLabel(shape: string): string {
  return /[sx]$/i.test(shape) ? shape : `${shape}s`;
}

function first(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  return (v ?? "").toString().slice(0, 80);
}

export function parseFilters(params: Record<string, string | string[] | undefined>): ShopFilters {
  return {
    forme: first(params.forme),
    finition: first(params.finition),
    collection: first(params.collection),
    tri: first(params.tri),
    q: first(params.q),
  };
}

export function filterOptions(products: Product[]) {
  const shapes = new Map<string, string>();
  const finishes = new Map<string, string>();
  for (const p of products) {
    if (p.shape) shapes.set(normalize(p.shape), p.shape);
    for (const v of p.variants) if (v.isActive && v.finish) finishes.set(v.finish, v.name);
  }
  return {
    shapes: [...shapes.entries()].map(([value, label]) => ({ value, label: pluralLabel(label) })),
    finishes: [...finishes.entries()].map(([value, label]) => ({ value, label })),
  };
}

/** Applique filtres, recherche et tri. Tout est fait côté serveur, sans SQL dynamique. */
export function applyFilters(products: Product[], f: ShopFilters): ShopCard[] {
  const q = normalize(f.q);
  const terms = q.split(/\s+/).filter(Boolean);
  const filtered = products.filter((p) => {
    if (f.forme && normalize(p.shape) !== normalize(f.forme)) return false;
    if (f.collection && !p.collections.some((c) => c.slug === f.collection)) return false;
    if (terms.length > 0) {
      const haystack = normalize(
        [p.name, p.shortDescription, p.description, p.shape, p.material, ...p.variants.map((v) => v.name), ...p.collections.map((c) => c.name)].join(" "),
      );
      if (!terms.every((t) => haystack.includes(t))) return false;
    }
    return true;
  });

  let cards = shopCards(filtered, true);
  if (f.finition) cards = cards.filter((c) => c.variant?.finish === f.finition);
  if (terms.length > 0) {
    // Si la recherche vise une finition (« argent », « doré »), on ne garde que celle-ci.
    const finishHits = cards.filter((c) => c.variant && terms.some((t) => normalize(c.variant!.name).startsWith(t.slice(0, 4))));
    if (finishHits.length > 0) cards = finishHits;
  }

  if (f.collection) {
    cards.sort((a, b) => {
      const ca = a.product.collections.find((c) => c.slug === f.collection)?.sortOrder ?? 0;
      const cb = b.product.collections.find((c) => c.slug === f.collection)?.sortOrder ?? 0;
      return (a.variant?.sortOrder ?? 0) - (b.variant?.sortOrder ?? 0) || ca - cb;
    });
  } else {
    // « Notre sélection » : comme les maquettes, une ligne par finition.
    cards.sort(
      (a, b) =>
        (a.variant?.sortOrder ?? 0) - (b.variant?.sortOrder ?? 0) || a.product.sortOrder - b.product.sortOrder,
    );
  }
  switch (f.tri) {
    case "prix-croissant":
      cards.sort((a, b) => a.priceCents - b.priceCents || a.title.localeCompare(b.title, "fr"));
      break;
    case "prix-decroissant":
      cards.sort((a, b) => b.priceCents - a.priceCents || a.title.localeCompare(b.title, "fr"));
      break;
    case "nom":
      cards.sort((a, b) => a.title.localeCompare(b.title, "fr"));
      break;
  }
  return cards;
}
