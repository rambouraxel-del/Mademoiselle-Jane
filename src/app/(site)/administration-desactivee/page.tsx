import type { Metadata } from "next";
import Link from "next/link";
import { DoodleHeart } from "@/components/site/decor";

export const metadata: Metadata = { title: "Administration désactivée", robots: { index: false, follow: false } };

/** Affichée à la place de /admin en mode aperçu visuel (PREVIEW_MODE=true). */
export default function AdminDisabledPage() {
  return (
    <div className="container-site max-w-2xl py-20 text-center">
      <DoodleHeart className="mx-auto" size={30} />
      <h1 className="mt-3 text-[2.4rem] lg:text-[3rem]">Administration désactivée</h1>
      <p className="mt-4 text-[1.1rem]">
        Ce lien est un aperçu visuel du site : l’administration, les commandes et les paiements n’y sont pas disponibles.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Retour à l’accueil
      </Link>
    </div>
  );
}
