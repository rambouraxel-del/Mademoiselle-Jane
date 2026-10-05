import type { MetadataRoute } from "next";
import { isPreviewActive } from "@/lib/preview/mode";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const site = siteUrl();
  if (isPreviewActive()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/panier", "/commande", "/newsletter", "/api"] }],
    sitemap: `${site}/sitemap.xml`,
  };
}
