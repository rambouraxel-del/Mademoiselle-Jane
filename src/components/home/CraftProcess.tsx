import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";

const steps = [
  {
    number: "01",
    title: "Le mélange",
    description: "Nous dosons et teintons la résine époxy selon la couleur et l'effet choisis.",
  },
  {
    number: "02",
    title: "La coulée",
    description: "Chaque médaille est coulée à la main dans un moule, avec soin et précision.",
  },
  {
    number: "03",
    title: "La gravure",
    description: "Le nom du chien et le texte personnalisé sont appliqués après durcissement.",
  },
  {
    number: "04",
    title: "La finition",
    description: "Ponçage, polissage et pose de l'anneau avant expédition soignée.",
  },
];

export function CraftProcess() {
  return (
    <section className="bg-cream-soft py-16 sm:py-20">
      <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <PhotoPlaceholder label="Fabrication en atelier" variant={2} className="aspect-[4/3] w-full" />
        <div>
          <SectionHeading
            eyebrow="Fabrication artisanale"
            title="Une résine, un savoir-faire"
            description="Chaque médaille passe par quatre étapes manuelles, du mélange de la résine à la finition, pour un objet unique et soigné."
          />
          <ol className="mt-8 grid gap-6 sm:grid-cols-2">
            {steps.map((step) => (
              <li key={step.number} className="flex gap-4">
                <span className="font-display text-2xl text-clay">{step.number}</span>
                <div>
                  <h3 className="font-medium text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
