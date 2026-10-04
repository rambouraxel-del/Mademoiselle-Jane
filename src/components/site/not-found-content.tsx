import Link from "next/link";
import { DoodleHeart } from "./decor";

export function NotFoundContent() {
  return (
    <div className="container-site max-w-2xl py-20 text-center">
      <DoodleHeart className="mx-auto" size={34} />
      <p className="eyebrow mt-4">Erreur 404</p>
      <h1 className="mt-3 text-[2.6rem] lg:text-[3.2rem]">Cette page s’est égarée…</h1>
      <p className="mt-4 text-[1.1rem]">La page demandée n’existe pas ou n’est plus disponible.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/medailles" className="btn btn-primary">Voir les médailles</Link>
        <Link href="/" className="btn btn-outline">Retour à l’accueil</Link>
      </div>
    </div>
  );
}
