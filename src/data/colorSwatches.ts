export interface ColorSwatch {
  id: string;
  label: string;
  hex: string;
}

/** Source de vérité pour les couleurs de résine (filtres boutique + options produit). */
export const colorSwatches: ColorSwatch[] = [
  { id: "ambre", label: "Ambre miel", hex: "#c99a4a" },
  { id: "terracotta", label: "Terracotta", hex: "#b5622f" },
  { id: "sauge", label: "Sauge", hex: "#7c8a6d" },
  { id: "blush", label: "Rose poudré", hex: "#e7bfae" },
  { id: "nuit", label: "Bleu nuit", hex: "#2b3350" },
  { id: "ivoire", label: "Ivoire", hex: "#f3e9da" },
];

export function getColorHex(id: string): string {
  return colorSwatches.find((c) => c.id === id)?.hex ?? "#c99a4a";
}

export function getColorLabel(id: string): string {
  return colorSwatches.find((c) => c.id === id)?.label ?? id;
}
