import type { Product } from "@/types";
import { defaultProductOptions } from "./productOptions";

/**
 * Catalogue de démonstration. Ces médailles sont fictives : elles servent
 * à démontrer toutes les fonctionnalités du site (filtres, personnalisation,
 * panier) et ne correspondent à aucune vente réelle.
 *
 * En production, ce fichier sera remplacé par un appel au service
 * `productService` branché sur Supabase (voir src/services/products.ts).
 */

const sizeVariants = () => [
  {
    id: "standard",
    name: "Taille standard — 3,5 cm",
    priceModifierCents: 0,
  },
  {
    id: "grande",
    name: "Grande taille — 4,5 cm",
    priceModifierCents: 500,
  },
];

export const products: Product[] = [
  {
    id: "p1",
    slug: "ronde-ambree",
    name: "Ronde Ambrée",
    shortDescription: "La médaille ronde intemporelle, coulée en résine couleur miel.",
    description:
      "Notre modèle rond signature, coulé à la main en résine époxy ambrée. Une base intemporelle qui met en valeur le nom de votre compagnon avec beaucoup de douceur. Chaque pièce est unique : les nuances et petites variations font partie du charme de la fabrication artisanale.",
    images: ["Vue de face", "Vue de profil", "Portée au collier"],
    basePriceCents: 2900,
    shape: "ronde",
    colors: ["ambre", "ivoire"],
    range: "essentielle",
    badges: ["populaire"],
    variants: sizeVariants(),
    options: defaultProductOptions,
    isActive: true,
  },
  {
    id: "p2",
    slug: "coeur-terracotta",
    name: "Cœur Terracotta",
    shortDescription: "Une forme cœur chaleureuse aux tons terracotta.",
    description:
      "Le cœur Terracotta associe une teinte chaude et enveloppante à une forme pleine de tendresse. Idéale pour un compagnon au caractère affectueux. Finition mate ou marbrée selon l'effet choisi.",
    images: ["Vue de face", "Détail texture", "Portée au collier"],
    basePriceCents: 3400,
    shape: "coeur",
    colors: ["terracotta", "blush"],
    range: "signature",
    badges: ["nouveaute", "populaire"],
    variants: sizeVariants(),
    options: defaultProductOptions,
    isActive: true,
  },
  {
    id: "p3",
    slug: "os-sauge",
    name: "Os Sauge",
    shortDescription: "Le classique os, dans une teinte sauge apaisante.",
    description:
      "Un modèle os généreux, parfait pour les grandes gravures. La teinte sauge, douce et naturelle, s'accorde avec tous les pelages. Un best-seller pour les chiens comme pour leurs humains.",
    images: ["Vue de face", "Vue de profil"],
    basePriceCents: 2900,
    shape: "os",
    colors: ["sauge", "ivoire"],
    range: "essentielle",
    badges: [],
    variants: sizeVariants(),
    options: defaultProductOptions,
    isActive: true,
  },
  {
    id: "p4",
    slug: "patte-nuit-etoilee",
    name: "Patte Nuit Étoilée",
    shortDescription: "Une empreinte de patte, résine bleu nuit et paillettes.",
    description:
      "Inspirée du ciel étoilé, cette médaille en forme de patte associe un bleu nuit profond à de fines paillettes dorées suspendues dans la résine. Une pièce premium pour les compagnons qui aiment briller la nuit tombée.",
    images: ["Vue de face", "Détail paillettes", "Portée au collier"],
    basePriceCents: 3900,
    shape: "patte",
    colors: ["nuit", "ambre"],
    range: "premium",
    badges: ["nouveaute"],
    variants: sizeVariants(),
    options: defaultProductOptions,
    isActive: true,
  },
  {
    id: "p5",
    slug: "ronde-galaxie",
    name: "Ronde Galaxie",
    shortDescription: "Un tourbillon de bleu nuit et de paillettes holographiques.",
    description:
      "Un modèle rond spectaculaire, pensé comme une petite galaxie portée au collier. Les paillettes holographiques captent la lumière sous tous les angles. Une pièce premium fabriquée en édition limitée.",
    images: ["Vue de face", "Détail reflets", "Portée au collier"],
    basePriceCents: 3900,
    shape: "ronde",
    colors: ["nuit", "blush"],
    range: "premium",
    badges: ["edition-limitee"],
    variants: sizeVariants(),
    options: defaultProductOptions,
    isActive: true,
  },
  {
    id: "p6",
    slug: "coeur-rose",
    name: "Cœur Rosé",
    shortDescription: "Douceur poudrée pour un compagnon plein de tendresse.",
    description:
      "Un cœur tout en douceur, dans un camaïeu de rose poudré et d'ivoire. Une médaille délicate, parfaite pour un premier compagnon ou une naissance canine.",
    images: ["Vue de face", "Vue de profil"],
    basePriceCents: 2900,
    shape: "coeur",
    colors: ["blush", "ivoire"],
    range: "essentielle",
    badges: [],
    variants: sizeVariants(),
    options: defaultProductOptions,
    isActive: true,
  },
  {
    id: "p7",
    slug: "os-foret",
    name: "Os Forêt",
    shortDescription: "Un os marbré vert sauge et terracotta, esprit sous-bois.",
    description:
      "L'Os Forêt marie le vert sauge et le terracotta dans un effet marbré évoquant une balade en sous-bois. Une médaille robuste et caractère pour les grands marcheurs.",
    images: ["Vue de face", "Détail marbrures", "Portée au collier"],
    basePriceCents: 3400,
    shape: "os",
    colors: ["sauge", "terracotta"],
    range: "signature",
    badges: [],
    variants: sizeVariants(),
    options: defaultProductOptions,
    isActive: true,
  },
  {
    id: "p8",
    slug: "patte-doree",
    name: "Patte Dorée",
    shortDescription: "L'empreinte de patte façon coulée d'or, notre pièce premium.",
    description:
      "Notre pièce la plus précieuse : une empreinte de patte tout en ambre profond, traversée de fines coulées dorées. Une médaille premium pour un compagnon qui mérite le meilleur.",
    images: ["Vue de face", "Détail dorures", "Portée au collier"],
    basePriceCents: 3900,
    shape: "patte",
    colors: ["ambre", "nuit"],
    range: "premium",
    badges: ["populaire"],
    variants: sizeVariants(),
    options: defaultProductOptions,
    isActive: true,
  },
];

export function getAllProducts(): Product[] {
  return products.filter((product) => product.isActive);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug && product.isActive);
}

export function getFeaturedProducts(limit = 4): Product[] {
  return getAllProducts()
    .filter((product) => product.badges.length > 0)
    .slice(0, limit);
}
