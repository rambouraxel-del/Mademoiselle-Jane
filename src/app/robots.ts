import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const site = siteUrl();
  if (process.env.PREVIEW_MODE?.trim().toLowerCase() === "true") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/panier", "/commande", "/newsletter", "/api"] }],
    sitemap: `${site}/sitemap.xml`,
  };
}
