import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteUrl as getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// Polices hébergées localement (licence SIL OFL, voir src/fonts/LICENSE-*.txt)
const ebGaramond = localFont({
  src: [
    { path: "../fonts/eb-garamond-latin-wght-normal.woff2", weight: "400 800", style: "normal" },
    { path: "../fonts/eb-garamond-latin-wght-italic.woff2", weight: "400 800", style: "italic" },
  ],
  variable: "--font-eb-garamond",
  display: "swap",
});

const figtree = localFont({
  src: [{ path: "../fonts/figtree-latin-wght-normal.woff2", weight: "300 900", style: "normal" }],
  variable: "--font-figtree",
  display: "swap",
});

const sacramento = localFont({
  src: [{ path: "../fonts/sacramento-latin-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-sacramento",
  display: "swap",
});

const siteUrl = getSiteUrl();

const preview = process.env.PREVIEW_MODE?.trim().toLowerCase() === "true";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // L'aperçu visuel ne doit jamais être indexé par les moteurs de recherche.
  ...(preview ? { robots: { index: false, follow: false } } : {}),
  title: {
    default: "Mademoizelle Jane — Médailles personnalisées pour chiens",
    template: "%s — Mademoizelle Jane",
  },
  description:
    "Médailles pour chiens en résine, personnalisées avec le prénom de votre compagnon, imaginées et réalisées à la main par Ophélie.",
  applicationName: "Mademoizelle Jane",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Mademoizelle Jane",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#f9f5ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${ebGaramond.variable} ${figtree.variable} ${sacramento.variable}`}>
      <body>{children}</body>
    </html>
  );
}
