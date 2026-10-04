import type { Metadata } from "next";
import { NewsletterTokenForm } from "@/components/site/newsletter-token-form";

export const metadata: Metadata = { title: "Se désinscrire", robots: { index: false, follow: false } };

export default async function UnsubscribePage({ searchParams }: PageProps<"/newsletter/desinscription">) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  return (
    <div className="container-site max-w-xl py-16 text-center">
      <h1 className="text-[2.6rem]">Désinscription</h1>
      <p className="mb-8 mt-3">Vous ne recevrez plus la newsletter de Mademoizelle Jane.</p>
      <NewsletterTokenForm token={token} mode="unsubscribe" />
    </div>
  );
}
