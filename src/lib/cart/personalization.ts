import { ENGRAVING_NAME_PATTERN, PHONE_PATTERN } from "@/lib/validation/common";
import type { PersonalizationField } from "@/lib/catalog/types";
import { normalizePersonalization, type Personalization } from "./types";

export type PersonalizationConfig = { name: PersonalizationField; phone: PersonalizationField };

/**
 * Vérifie la personnalisation selon la configuration du produit.
 * Utilisée dans le navigateur (confort) ET sur le serveur (seule vérification qui fait foi).
 */
export function validatePersonalization(
  config: PersonalizationConfig,
  input: Personalization,
): { value: Personalization; errors: Partial<Record<keyof Personalization, string>> } {
  const value = normalizePersonalization(input);
  const errors: Partial<Record<keyof Personalization, string>> = {};

  if (!config.name.enabled) {
    delete value.name;
  } else if (!value.name) {
    if (config.name.required) errors.name = "Indiquez le prénom de votre animal.";
  } else if ([...value.name].length > config.name.maxLength) {
    errors.name = `${config.name.maxLength} caractères maximum.`;
  } else if (!ENGRAVING_NAME_PATTERN.test(value.name)) {
    errors.name = "Utilisez uniquement des lettres, espaces, tirets ou apostrophes.";
  }

  if (!config.phone.enabled) {
    delete value.phone;
  } else if (!value.phone) {
    if (config.phone.required) errors.phone = "Indiquez le numéro à graver au dos.";
  } else if (value.phone.length > config.phone.maxLength) {
    errors.phone = `${config.phone.maxLength} caractères maximum.`;
  } else if (!PHONE_PATTERN.test(value.phone)) {
    errors.phone = "Numéro invalide (chiffres, espaces, + et tirets uniquement).";
  }

  return { value, errors };
}
