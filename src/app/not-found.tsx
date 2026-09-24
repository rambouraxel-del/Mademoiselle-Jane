import { ButtonLink } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <div className="container-site flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Erreur 404</span>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Page introuvable</h1>
      <p className="max-w-md text-ink-soft">
        Cette page n&apos;existe pas ou plus. Peut-être cherchiez-vous une de nos médailles ?
      </p>
      <ButtonLink href="/boutique" className="mt-2">
        Retour à la boutique
      </ButtonLink>
    </div>
  );
}
