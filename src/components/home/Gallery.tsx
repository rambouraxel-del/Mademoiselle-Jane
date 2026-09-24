import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";

const galleryItems = [
  "Atelier — mélange des pigments",
  "Coulée en résine",
  "Médaille portée au collier",
  "Détail des paillettes",
  "Emballage soigné",
  "Collection complète",
];

export function Gallery() {
  return (
    <section className="container-site py-16 sm:py-20">
      <SectionHeading
        eyebrow="Galerie"
        title="Dans les coulisses de l'atelier"
        align="center"
        className="mx-auto"
      />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {galleryItems.map((item, index) => (
          <PhotoPlaceholder
            key={item}
            label={item}
            variant={index}
            className={`aspect-square ${index === 0 ? "col-span-2 row-span-2 aspect-auto sm:aspect-square" : ""}`}
          />
        ))}
      </div>
    </section>
  );
}
