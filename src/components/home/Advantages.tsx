import { SectionHeading } from "@/components/ui/SectionHeading";

const advantages = [
  {
    title: "100% fait main",
    description: "Chaque pièce est coulée et finie à la main dans notre atelier.",
    icon: "✦",
  },
  {
    title: "Personnalisable à l'infini",
    description: "Formes, couleurs, effets et textes s'adaptent à votre chien.",
    icon: "◐",
  },
  {
    title: "Résistante au quotidien",
    description: "Une résine époxy conçue pour accompagner les balades et les jeux.",
    icon: "◈",
  },
  {
    title: "Emballage soigné",
    description: "Chaque commande est préparée avec attention avant expédition.",
    icon: "❁",
  },
];

export function Advantages() {
  return (
    <section className="bg-cream-soft py-16 sm:py-20">
      <div className="container-site">
        <SectionHeading eyebrow="Pourquoi Mademoiselle Jane" title="Des médailles pensées avec soin" align="center" className="mx-auto" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((advantage) => (
            <div key={advantage.title} className="flex flex-col items-center gap-3 rounded-card bg-paper p-6 text-center shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-clay/10 text-xl text-clay">
                {advantage.icon}
              </span>
              <h3 className="font-medium text-ink">{advantage.title}</h3>
              <p className="text-sm text-ink-soft">{advantage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
