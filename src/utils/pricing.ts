import type { CartItemOptionSelection, Product, ProductVariant } from "@/types";

/**
 * Calcule le prix unitaire (en centimes) d'une médaille configurée :
 * prix de base + supplément de variante + suppléments des options choisies.
 */
export function calculateUnitPriceCents(
  product: Product,
  variant: ProductVariant | undefined,
  selectedOptions: CartItemOptionSelection[]
): number {
  const variantModifier = variant?.priceModifierCents ?? 0;
  const optionsModifier = selectedOptions.reduce(
    (sum, option) => sum + (option.priceModifierCents || 0),
    0
  );
  return product.basePriceCents + variantModifier + optionsModifier;
}
