import type { ProductOption } from "@/types";
import { colorSwatches } from "./colorSwatches";

/**
 * Options de personnalisation communes, réutilisées et adaptées par
 * produit. En production, ces valeurs proviendront de Supabase — la
 * structure ne change pas.
 */

export const resinColorOption: ProductOption = {
  id: "couleur-resine",
  label: "Couleur de la résine",
  type: "color",
  required: true,
  values: colorSwatches.map((swatch) => ({
    id: swatch.id,
    label: swatch.label,
    value: swatch.hex,
    priceModifierCents: swatch.id === "nuit" ? 200 : 0,
  })),
};

export const resinEffectOption: ProductOption = {
  id: "effet-resine",
  label: "Effet de résine",
  description: "Ajoute du mouvement et de la profondeur à la pièce.",
  type: "select",
  required: false,
  values: [
    { id: "uni", label: "Uni", priceModifierCents: 0 },
    { id: "marbre", label: "Marbré", priceModifierCents: 300 },
    { id: "paillettes-fines", label: "Paillettes fines", priceModifierCents: 300 },
    {
      id: "paillettes-holo",
      label: "Paillettes holographiques",
      priceModifierCents: 450,
    },
    {
      id: "inclusions-florales",
      label: "Inclusions florales séchées",
      priceModifierCents: 500,
    },
  ],
};

export const inscriptionColorOption: ProductOption = {
  id: "couleur-inscription",
  label: "Couleur des inscriptions",
  type: "color",
  required: true,
  values: [
    { id: "blanc", label: "Blanc", value: "#ffffff" },
    { id: "or", label: "Doré", value: "#c99a4a" },
    { id: "noir", label: "Noir", value: "#2c2420" },
    { id: "cuivre", label: "Cuivré", value: "#b5622f" },
  ],
};

export const ringOption: ProductOption = {
  id: "anneau",
  label: "Anneau / accessoire",
  type: "select",
  required: true,
  values: [
    { id: "anneau-simple", label: "Anneau simple inclus", priceModifierCents: 0 },
    {
      id: "mousqueton-dore",
      label: "Mousqueton doré",
      priceModifierCents: 250,
    },
    {
      id: "mousqueton-argente",
      label: "Mousqueton argenté",
      priceModifierCents: 250,
    },
  ],
};

export const giftPouchOption: ProductOption = {
  id: "pochette-cadeau",
  label: "Pochette cadeau en lin",
  type: "checkbox",
  required: false,
  priceModifierCents: 350,
};

export const defaultProductOptions: ProductOption[] = [
  resinColorOption,
  resinEffectOption,
  inscriptionColorOption,
  ringOption,
  giftPouchOption,
];
