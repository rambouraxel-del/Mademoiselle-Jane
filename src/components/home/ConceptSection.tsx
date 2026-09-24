import { SectionHeading } from "@/components/ui/SectionHeading";

const points = [
  {
    title: "Coulée à la main",
    description: "Chaque médaille est coulée en résine époxy dans notre atelier, une à une.",
  },
  {
    title: "Personnalisation complète",
    description: "Forme, couleur, effets, paillettes, texte gravé : vous composez chaque détail.",
  },
  {
    title: "Pensée pour durer",
    description: "Une résine résistante aux chocs et à l'humidité du quotidien.",
  },
];

export function ConceptSection() {
  return (
    <section className="container-site py-16 sm:py-20">
      <SectionHeading
        eyebrow="Le concept"
        title="Une médaille, une histoire"
        description="Mademoiselle Jane crée des médailles pour chiens qui vont au-delà de l'identification : de véritables objets affectifs, façonnés à la main et personnalisés pour chaque compagnon."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {points.map((point) => (
          <div key={point.title} className="rounded-card border border-border/70 bg-paper p-6">
            <h3 className="font-display text-lg text-ink">{point.title}</h3>
            <p className="mt-2 text-sm text-ink-soft">{point.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
