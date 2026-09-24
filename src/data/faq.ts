export interface FaqItem {
  id: string;
  category: "fabrication" | "personnalisation" | "livraison" | "entretien" | "commande";
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    id: "f1",
    category: "fabrication",
    question: "Comment sont fabriquées les médailles ?",
    answer:
      "Chaque médaille est coulée à la main dans notre atelier, en résine époxy de qualité. Les pigments, effets et inclusions sont ajoutés manuellement avant polymérisation, ce qui rend chaque pièce légèrement unique.",
  },
  {
    id: "f2",
    category: "fabrication",
    question: "La résine époxy est-elle solide et sans danger pour mon chien ?",
    answer:
      "Oui. Une fois durcie, la résine époxy utilisée est stable, résistante aux chocs du quotidien et ne présente pas de risque pour votre animal en usage normal (médaille portée au collier).",
  },
  {
    id: "f3",
    category: "personnalisation",
    question: "Puis-je choisir la couleur, les effets et le texte de ma médaille ?",
    answer:
      "Oui, chaque produit propose ses propres options : couleur de résine, effet (marbré, paillettes, inclusions...), couleur des inscriptions, ainsi que des zones dédiées pour le nom du chien, un numéro de téléphone et un texte personnalisé.",
  },
  {
    id: "f4",
    category: "personnalisation",
    question: "Y a-t-il une limite de caractères pour le texte gravé ?",
    answer:
      "Oui, chaque zone de texte indique sa longueur maximale directement sur la fiche produit, afin de garantir un rendu lisible et harmonieux sur la médaille.",
  },
  {
    id: "f5",
    category: "livraison",
    question: "Quels sont les délais de fabrication et de livraison ?",
    answer:
      "Comptez en moyenne 5 à 8 jours ouvrés de fabrication artisanale, puis 2 à 4 jours ouvrés de livraison. Ces délais sont indicatifs pour cette version de démonstration du site.",
  },
  {
    id: "f6",
    category: "entretien",
    question: "Comment entretenir ma médaille en résine ?",
    answer:
      "Un simple nettoyage à l'eau tiède et au chiffon doux suffit. Évitez les produits chimiques agressifs et les chocs violents qui pourraient marquer la surface.",
  },
  {
    id: "f7",
    category: "entretien",
    question: "La médaille résiste-t-elle à l'eau et aux frottements ?",
    answer:
      "La résine époxy est naturellement résistante à l'humidité et aux éclaboussures du quotidien. Nous recommandons toutefois d'éviter une immersion prolongée.",
  },
  {
    id: "f8",
    category: "commande",
    question: "Puis-je modifier ou annuler ma commande après validation ?",
    answer:
      "Tant que la fabrication n'a pas commencé, vous pouvez nous contacter pour modifier ou annuler votre commande. Passé ce délai, chaque médaille étant personnalisée, la modification n'est plus possible.",
  },
];
