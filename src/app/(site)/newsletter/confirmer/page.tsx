import type { Metadata } from "next";
import { NewsletterTokenForm } from "@/components/site/newsletter-token-form";

export const metadata: Metadata = { title: "Confirmer mon inscription", robots: { index: false, follow: false } };

export default async function ConfirmNewsletterPage({ searchParams }: PageProps<"/newsletter/confirmer">) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  return (
    <div className="container-site max-w-xl py-16 text-center">
      <h1 className="text-[2.6rem]">Newsletter</h1>
      <p className="mb-8 mt-3">Confirmez votre inscription pour recevoir les nouveautés de Mademoizelle Jane.</p>
      <NewsletterTokenForm token={token} mode="confirm" />
    </div>
  );
}
