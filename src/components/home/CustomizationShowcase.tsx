import { SectionHeading } from "@/components/ui/SectionHeading";
import { MedalPlaceholder } from "@/components/ui/MedalPlaceholder";
import { ButtonLink } from "@/components/ui/ButtonLink";

const options = [
  { label: "Forme", value: "Ronde, cœur, os ou patte" },
  { label: "Couleur de résine", value: "6 teintes, dont des effets premium" },
  { label: "Effets", value: "Marbré, paillettes, inclusions florales" },
  { label: "Inscriptions", value: "Nom du chien, texte libre, téléphone" },
];

export function CustomizationShowcase() {
  return (
    <section className="container-site py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            eyebrow="Personnalisation"
            title="Composez la médaille de votre chien"
            description="Chaque fiche produit propose ses propres options : à vous de choisir la combinaison qui ressemble à votre compagnon."
          />
          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            {options.map((option) => (
              <div key={option.label}>
                <dt className="text-sm font-semibold text-clay">{option.label}</dt>
                <dd className="mt-1 text-sm text-ink-soft">{option.value}</dd>
              </div>
            ))}
          </dl>
          <ButtonLink href="/boutique" className="mt-8">
            Commencer la personnalisation
          </ButtonLink>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <MedalPlaceholder shape="ronde" colors={["nuit", "blush"]} seed={2} caption="Ronde Galaxie" />
          <MedalPlaceholder shape="patte" colors={["ambre", "nuit"]} seed={1} caption="Patte Dorée" className="mt-8" />
          <MedalPlaceholder shape="os" colors={["sauge", "terracotta"]} caption="Os Forêt" />
          <MedalPlaceholder shape="coeur" colors={["terracotta", "blush"]} seed={3} caption="Cœur Terracotta" className="mt-8" />
        </div>
      </div>
    </section>
  );
}
