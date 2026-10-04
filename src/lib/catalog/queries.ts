import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { PRODUCT_SELECT, mapCollection, mapProduct, type ProductQueryRow } from "./map";
import type { Collection, Product } from "./types";

/**
 * Lectures publiques du catalogue. Le client « visiteur » est soumis aux règles
 * RLS : seuls les produits publiés (et leurs variantes / photos) sont visibles.
 * Les pages publiques sont rendues à la demande : une modification enregistrée
 * dans l'administration est visible immédiatement, sans redéploiement.
 */

function sortProducts(products: Product[]): Product[] {
  return products.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fr"));
}

export const getPublishedProducts = cache(async (): Promise<Product[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published");
  if (error) throw new Error(`Lecture du catalogue impossible : ${error.message}`);
  return sortProducts((data as unknown as ProductQueryRow[]).map(mapProduct));
});

export const getPublishedProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Lecture du produit impossible : ${error.message}`);
  return data ? mapProduct(data as unknown as ProductQueryRow) : null;
});

export const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  const products = await getPublishedProducts();
  return products
    .filter((p) => p.isFeatured)
    .sort((a, b) => a.featuredOrder - b.featuredOrder || a.sortOrder - b.sortOrder);
});

export const getPublishedCollections = cache(async (): Promise<Collection[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*, image:media (*)")
    .eq("is_published", true)
    .order("sort_order")
    .order("name");
  if (error) throw new Error(`Lecture des collections impossible : ${error.message}`);
  return (data ?? []).map((row) => mapCollection(row));
});
