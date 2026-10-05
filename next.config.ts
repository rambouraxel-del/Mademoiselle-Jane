import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;
const isLocalSupabase =
  supabaseUrl !== null && ["127.0.0.1", "localhost"].includes(supabaseUrl.hostname);

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Mémorise le mode aperçu au moment du build (voir src/lib/preview/mode.ts).
  env: {
    MJ_PREVIEW_MODE_BUILD: process.env.PREVIEW_MODE ?? process.env.NEXT_PUBLIC_PREVIEW_MODE ?? "",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
            hostname: supabaseUrl.hostname,
            port: supabaseUrl.port,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
    // Supabase local tourne sur 127.0.0.1 : autorisé uniquement dans ce cas.
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
  experimental: {
    serverActions: {
      // Les photos sont redimensionnées dans le navigateur avant l'envoi.
      bodySizeLimit: "4mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
