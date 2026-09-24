import type { Product, ProductRange, ProductShape } from "@/types";
import { getAllProducts, getFeaturedProducts, getProductBySlug } from "@/data/products";

/**
 * Couche de service produits. Aujourd'hui basée sur les données de
 * démonstration locales ; demain, ces fonctions liront depuis Supabase
 * (table `products`) sans que les composants appelants n'aient à changer.
 * Les fonctions sont volontairement asynchrones pour anticiper ce passage.
 */

export interface ProductFilters {
  shape?: ProductShape;
  color?: string;
  range?: ProductRange;
  maxPriceCents?: number;
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let items = getAllProducts();

  if (filters.shape) {
    items = items.filter((product) => product.shape === filters.shape);
  }
  if (filters.color) {
    items = items.filter((product) => product.colors.includes(filters.color!));
  }
  if (filters.range) {
    items = items.filter((product) => product.range === filters.range);
  }
  if (typeof filters.maxPriceCents === "number") {
    items = items.filter((product) => product.basePriceCents <= filters.maxPriceCents!);
  }

  return items;
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  return getProductBySlug(slug);
}

export async function fetchFeaturedProducts(limit = 4): Promise<Product[]> {
  return getFeaturedProducts(limit);
}
