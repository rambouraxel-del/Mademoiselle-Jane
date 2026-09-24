/**
 * Types produit. Les options de personnalisation sont pilotées par ces
 * structures (données) et jamais codées en dur dans les composants.
 */

export type ProductOptionType = "text" | "color" | "select" | "checkbox" | "image";

export interface ProductOptionValue {
  id: string;
  label: string;
  /** Code couleur (hex) pour type "color", url image pour type "image". */
  value?: string;
  /** Supplément tarifaire en centimes d'euro. */
  priceModifierCents?: number;
}

export interface ProductOption {
  id: string;
  label: string;
  description?: string;
  type: ProductOptionType;
  required: boolean;
  /** Longueur maximale pour les options de type "text". */
  maxLength?: number;
  placeholder?: string;
  /** Valeurs disponibles pour select / color / image. */
  values?: ProductOptionValue[];
  /** Supplément tarifaire en centimes pour un checkbox coché. */
  priceModifierCents?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  /** Supplément ou remise en centimes par rapport au prix de base. */
  priceModifierCents: number;
  image?: string;
}

export type ProductShape = "ronde" | "coeur" | "os" | "patte";

export type ProductBadge = "nouveaute" | "populaire" | "edition-limitee";

export type ProductRange = "essentielle" | "signature" | "premium";

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  /** Images (placeholders faciles à remplacer). */
  images: string[];
  /** Prix de départ en centimes d'euro. */
  basePriceCents: number;
  shape: ProductShape;
  /** Couleurs dominantes affichées pour les filtres boutique. */
  colors: string[];
  range: ProductRange;
  badges: ProductBadge[];
  variants: ProductVariant[];
  options: ProductOption[];
  isActive: boolean;
}
