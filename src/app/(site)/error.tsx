"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Journal minimal, sans donnée personnelle.
    console.error("Erreur d’affichage", error.digest ?? "");
  }, [error]);
  return (
    <div className="container-site max-w-2xl py-20 text-center" role="alert">
      <h1 className="text-[2.4rem]">Oups, un petit souci</h1>
      <p className="mt-4">La page n’a pas pu s’afficher. Merci de réessayer dans un instant.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn btn-primary">Réessayer</button>
        <Link href="/" className="btn btn-outline">Retour à l’accueil</Link>
      </div>
    </div>
  );
}
