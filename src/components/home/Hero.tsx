import { ButtonLink } from "@/components/ui/ButtonLink";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
import { MedalPlaceholder } from "@/components/ui/MedalPlaceholder";

export function Hero() {
  return (
    <section className="container-site grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
      <div className="flex flex-col gap-6 animate-fade-in-up">
        <span className="inline-flex w-fit items-center rounded-full bg-clay/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
          Fait main, en petite série
        </span>
        <h1 className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
          La médaille qui raconte
          <br className="hidden sm:block" /> l&apos;histoire de votre chien
        </h1>
        <p className="max-w-lg text-lg text-ink-soft">
          Des médailles coulées à la main en résine époxy, personnalisables jusqu&apos;au
          moindre détail : forme, couleur, effets, texte gravé. Une pièce unique,
          pensée pour votre compagnon.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <ButtonLink href="/boutique" size="lg">
            Créer sa médaille
          </ButtonLink>
          <ButtonLink href="/a-propos" variant="outline" size="lg">
            Découvrir l&apos;atelier
          </ButtonLink>
        </div>
      </div>

      <div className="relative">
        <PhotoPlaceholder label="Atelier" variant={0} className="aspect-[4/5] w-full" />
        <div className="absolute -bottom-8 -left-6 w-32 sm:w-40">
          <MedalPlaceholder shape="coeur" colors={["terracotta", "blush"]} className="shadow-lift" />
        </div>
        <div className="absolute -right-4 -top-6 w-24 sm:w-28">
          <MedalPlaceholder shape="ronde" colors={["ambre", "ivoire"]} seed={1} className="shadow-lift" />
        </div>
      </div>
    </section>
  );
}
