import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { isPreviewMode, isSupabaseConfigured } from "@/lib/env";
import { previewFaq, previewMedia, previewPages, previewSettings, previewShippingZones } from "@/lib/preview/data";
import { mapMedia } from "@/lib/catalog/map";
import type { MediaRef } from "@/lib/catalog/types";
import { DEFAULTS, mergeSettings, type AllSettings, type SettingsKey } from "./sections";

export type FaqItem = { id: string; question: string; answer: string };
export type InfoPage = { slug: string; title: string; body: string; isComplete: boolean; seoDescription: string };
export type ShippingZone = {
  id: string;
  name: string;
  countries: string[];
  priceCents: number;
  freeFromCents: number | null;
  delayText: string;
};

function defaultSettings(): AllSettings {
  const out = {} as Record<string, unknown>;
  for (const key of Object.keys(DEFAULTS) as SettingsKey[]) out[key] = mergeSettings(key, null);
  return out as AllSettings;
}

/** Tous les contenus publics du site, fusionnés avec les valeurs par défaut. */
export const getSettings = cache(async (): Promise<AllSettings> => {
  if (isPreviewMode()) return previewSettings();
  if (!isSupabaseConfigured()) return defaultSettings();
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw new Error(`Lecture des contenus impossible : ${error.message}`);
  const out = defaultSettings() as Record<string, unknown>;
  for (const row of data ?? []) {
    if (row.key in DEFAULTS) out[row.key] = mergeSettings(row.key as SettingsKey, row.value);
  }
  return out as AllSettings;
});

/** Résout des identifiants de médias (champs image des contenus). */
export const getMediaByIds = cache(async (idsKey: string): Promise<Record<string, MediaRef>> => {
  const ids = idsKey.split(",").filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (ids.length === 0) return {};
  if (isPreviewMode()) return previewMedia(ids);
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("media").select("*").in("id", ids);
  if (error) throw new Error(`Lecture des médias impossible : ${error.message}`);
  const out: Record<string, MediaRef> = {};
  for (const row of data ?? []) out[row.id] = mapMedia(row)!;
  return out;
});

export async function resolveImages(ids: string[]): Promise<Record<string, MediaRef>> {
  const unique = [...new Set(ids.filter(Boolean))].sort();
  return getMediaByIds(unique.join(","));
}

export const getFaq = cache(async (): Promise<FaqItem[]> => {
  if (isPreviewMode()) return previewFaq();
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("faq_items")
    .select("id, question, answer")
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw new Error(`Lecture de la FAQ impossible : ${error.message}`);
  return data ?? [];
});

export const getInfoPage = cache(async (slug: string): Promise<InfoPage | null> => {
  if (isPreviewMode()) return previewPages().find((p) => p.slug === slug) ?? null;
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("pages").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Lecture de la page impossible : ${error.message}`);
  if (!data) return null;
  return {
    slug: data.slug,
    title: data.title,
    body: data.body,
    isComplete: data.is_complete,
    seoDescription: data.seo_description,
  };
});

export const getInfoPages = cache(async (): Promise<Pick<InfoPage, "slug" | "title">[]> => {
  if (isPreviewMode()) return previewPages().map(({ slug, title }) => ({ slug, title }));
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("pages").select("slug, title").order("sort_order");
  if (error) throw new Error(`Lecture des pages impossible : ${error.message}`);
  return data ?? [];
});

export const getShippingZones = cache(async (): Promise<ShippingZone[]> => {
  if (isPreviewMode()) return previewShippingZones();
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("shipping_zones")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error(`Lecture des zones de livraison impossible : ${error.message}`);
  return (data ?? []).map((z) => ({
    id: z.id,
    name: z.name,
    countries: z.countries,
    priceCents: z.price_cents,
    freeFromCents: z.free_from_cents,
    delayText: z.delay_text,
  }));
});
