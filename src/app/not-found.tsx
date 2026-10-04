import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { NotFoundContent } from "@/components/site/not-found-content";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="min-h-dvh">
      <div className="border-b border-line py-6">
        <Link href="/" className="mx-auto block w-56" aria-label="Mademoizelle Jane — accueil">
          <Logo alt="Mademoizelle Jane" />
        </Link>
      </div>
      <NotFoundContent />
    </main>
  );
}
