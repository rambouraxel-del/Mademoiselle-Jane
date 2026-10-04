import type { Metadata } from "next";
import Link from "next/link";
import { DoodleHeart } from "@/components/site/decor";

export const metadata: Metadata = { title: "Paiement annulé", robots: { index: false, follow: false } };

export default function CancelledPage() {
  return (
    <div className="container-site max-w-2xl py-16 text-center lg:py-20">
      <DoodleHeart className="mx-auto" size={30} />
      <h1 className="mt-3 text-[2.6rem] lg:text-[3.2rem]">Paiement annulé</h1>
      <p className="mt-4 text-[1.1rem]">
        Aucun montant n’a été encaissé. Votre panier est conservé : vous pouvez le modifier ou reprendre le paiement
        quand vous le souhaitez.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/panier" className="btn btn-primary">
          Retour au panier
        </Link>
        <Link href="/contact" className="btn btn-outline">
          Une question ?
        </Link>
      </div>
    </div>
  );
}
