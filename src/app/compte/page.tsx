import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Mon compte",
  description: "Espace client Mademoiselle Jane.",
};

export default function AccountPage() {
  return (
    <div className="container-site flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
        Espace client
      </span>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">
        Bientôt disponible
      </h1>
      <p className="max-w-md text-ink-soft">
        La création de compte, le suivi de commandes et l&apos;authentification
        arrivent avec l&apos;intégration de Supabase, au prochain lot. Vous
        pourrez déjà personnaliser et ajouter des médailles au panier sans
        compte.
      </p>
      <ButtonLink href="/boutique" className="mt-2">
        Découvrir la boutique
      </ButtonLink>
    </div>
  );
}
