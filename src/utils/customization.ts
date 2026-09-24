import type { CartItemCustomization } from "@/types";

/** Longueurs maximales pour les zones de personnalisation libre. */
export const CUSTOMIZATION_LIMITS = {
  dogName: 20,
  phoneNumber: 20,
  customText: 40,
} as const;

export interface CustomizationErrors {
  dogName?: string;
  phoneNumber?: string;
  customText?: string;
}

/**
 * Valide les champs de personnalisation libre. Le nom du chien est
 * obligatoire, le téléphone et le texte personnalisé sont facultatifs
 * mais bornés en longueur.
 */
export function validateCustomization(
  customization: CartItemCustomization
): CustomizationErrors {
  const errors: CustomizationErrors = {};

  const dogName = customization.dogName?.trim() ?? "";
  if (!dogName) {
    errors.dogName = "Le nom du chien est requis pour la gravure.";
  } else if (dogName.length > CUSTOMIZATION_LIMITS.dogName) {
    errors.dogName = `${CUSTOMIZATION_LIMITS.dogName} caractères maximum.`;
  }

  const phone = customization.phoneNumber?.trim() ?? "";
  if (phone.length > CUSTOMIZATION_LIMITS.phoneNumber) {
    errors.phoneNumber = `${CUSTOMIZATION_LIMITS.phoneNumber} caractères maximum.`;
  }

  const customText = customization.customText?.trim() ?? "";
  if (customText.length > CUSTOMIZATION_LIMITS.customText) {
    errors.customText = `${CUSTOMIZATION_LIMITS.customText} caractères maximum.`;
  }

  return errors;
}

export function hasCustomizationErrors(errors: CustomizationErrors): boolean {
  return Object.keys(errors).length > 0;
}
