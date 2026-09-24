import type { Product, ProductVariant } from "./product";

export interface CartItemOptionSelection {
  optionId: string;
  optionLabel: string;
  /** Identifiant + libellé de la valeur choisie (select / color / image). */
  valueId?: string;
  valueLabel?: string;
  /** Saisie libre pour les options de type "text". */
  textValue?: string;
  /** Coché ou non pour les options de type "checkbox". */
  checked?: boolean;
  priceModifierCents: number;
}

export interface CartItemCustomization {
  dogName?: string;
  phoneNumber?: string;
  customText?: string;
}

export interface CartItem {
  /** Identifiant unique de la ligne panier (pas l'id produit). */
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  image: string;
  variantId?: string;
  variantName?: string;
  selectedOptions: CartItemOptionSelection[];
  customization: CartItemCustomization;
  quantity: number;
  /** Prix unitaire incluant variante + options, en centimes. */
  unitPriceCents: number;
  /** Prix total de la ligne (unitPriceCents * quantity), en centimes. */
  lineTotalCents: number;
}

export interface CartSummary {
  itemCount: number;
  subtotalCents: number;
  shippingEstimateCents: number;
  totalCents: number;
}

export interface BuildCartItemInput {
  product: Product;
  variant?: ProductVariant;
  selectedOptions: CartItemOptionSelection[];
  customization: CartItemCustomization;
  quantity: number;
}
