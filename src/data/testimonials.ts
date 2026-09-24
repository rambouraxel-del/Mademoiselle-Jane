export interface Testimonial {
  id: string;
  authorName: string;
  dogName: string;
  quote: string;
  rating: number;
}

/**
 * Témoignages fictifs utilisés uniquement à des fins de démonstration
 * visuelle. Clairement identifiés comme tels dans l'interface — à
 * remplacer par de vrais avis clients.
 */
export const demoTestimonials: Testimonial[] = [
  {
    id: "t1",
    authorName: "Camille",
    dogName: "Pépite",
    quote:
      "La médaille est encore plus belle en vrai. Les couleurs choisies rendent parfaitement et la finition est impeccable.",
    rating: 5,
  },
  {
    id: "t2",
    authorName: "Antoine",
    dogName: "Ulysse",
    quote:
      "Un vrai coup de cœur, on sent le travail artisanal. Le délai a été respecté et l'emballage très soigné.",
    rating: 5,
  },
  {
    id: "t3",
    authorName: "Léa",
    dogName: "Mimosa",
    quote:
      "J'ai adoré pouvoir choisir chaque détail. Le résultat est unique, exactement comme sur l'aperçu.",
    rating: 4,
  },
];
