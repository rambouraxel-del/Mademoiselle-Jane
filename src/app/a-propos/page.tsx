import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "À propos",
  description: "L'histoire de Mademoiselle Jane, atelier de médailles pour chiens en résine époxy.",
};

const values = [
  {
    title: "Résine époxy",
    description:
      "Nous travaillons une résine époxy de qualité, choisie pour sa clarté, sa résistance et la richesse des effets qu'elle permet.",
  },
  {
    title: "Personnalisation",
    description:
      "Chaque commande est unique : forme, couleur, effets et inscriptions sont choisis par vous, pour votre chien.",
  },
  {
    title: "Qualité & soin",
    description:
      "Du mélange de la résine à l'emballage final, chaque étape est réalisée avec attention, en petites séries.",
  },
];

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-16">
      <section className="container-site grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Notre histoire</span>
          <h1 className="mt-3 font-display text-3xl text-ink sm:text-4xl">
            Mademoiselle Jane, un atelier né d&apos;une passion pour les chiens
          </h1>
          <div className="mt-4 flex flex-col gap-4 text-ink-soft">
            <p>
              <em>Contenu de démonstration, à remplacer par votre propre histoire.</em>
            </p>
            <p>
              Mademoiselle Jane est né d&apos;une envie simple : offrir à chaque chien une médaille
              qui lui ressemble vraiment. Après plusieurs essais dans un petit atelier, la résine
              époxy s&apos;est imposée comme une évidence — sa transparence et sa profondeur
              permettent des couleurs et des effets impossibles à obtenir autrement.
            </p>
            <p>
              Aujourd&apos;hui, chaque médaille est toujours coulée à la main, une à une, avec la
              même exigence de qualité qu&apos;au premier jour.
            </p>
          </div>
        </div>
        <PhotoPlaceholder label="Portrait de l'atelier" variant={1} className="aspect-[4/5] w-full" />
      </section>

      <section className="container-site mt-16 sm:mt-24">
        <SectionHeading eyebrow="Nos engagements" title="Ce qui compte pour nous" align="center" className="mx-auto" />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="rounded-card border border-border/70 bg-paper p-6">
              <h3 className="font-display text-lg text-ink">{value.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-site mt-16 flex flex-col items-center gap-4 rounded-card bg-cream-soft py-14 text-center sm:mt-24">
        <h2 className="font-display text-2xl text-ink sm:text-3xl">Prêt·e à créer sa médaille ?</h2>
        <p className="max-w-md text-ink-soft">
          Découvrez notre collection et personnalisez la médaille de votre compagnon.
        </p>
        <ButtonLink href="/boutique" size="lg">
          Voir la boutique
        </ButtonLink>
      </section>
    </div>
  );
}
