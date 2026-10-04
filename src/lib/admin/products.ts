import "server-only";
import { PRODUCT_SELECT, mapProduct, type ProductQueryRow } from "@/lib/catalog/map";
import type { Product } from "@/lib/catalog/types";
import type { AdminSession } from "@/lib/auth/admin";

/** Lecture administrateur (tous statuts, via RLS « admin »). */
export async function adminGetProducts(admin: AdminSession): Promise<Product[]> {
  const { data, error } = await admin.supabase.from("products").select(PRODUCT_SELECT).order("sort_order").order("name");
  if (error) throw new Error(error.message);
  return (data as unknown as ProductQueryRow[]).map(mapProduct);
}

export async function adminGetProduct(admin: AdminSession, id: string): Promise<Product | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await admin.supabase.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProduct(data as unknown as ProductQueryRow) : null;
}
