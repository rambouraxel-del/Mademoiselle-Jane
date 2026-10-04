import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/catalog/queries";
import { getInfoPages } from "@/lib/content/queries";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const base: MetadataRoute.Sitemap = ["", "/medailles", "/notre-histoire", "/contact"].map((path) => ({
    url: `${site}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
  if (!isSupabaseConfigured()) return base;
  const [products, pages] = await Promise.all([getPublishedProducts(), getInfoPages()]);
  return [
    ...base,
    ...products.map((p) => ({
      url: `${site}/medailles/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...pages.map((p) => ({ url: `${site}/infos/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
