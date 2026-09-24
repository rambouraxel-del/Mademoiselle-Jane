import type { ProductShape } from "@/types";

/**
 * Encode un visuel de médaille "placeholder" (forme + couleurs) dans une
 * simple chaîne de caractères, stockée dans `CartItem.image`. Permet de
 * conserver un champ `image: string` classique (compatible avec de vraies
 * URLs à l'avenir) tout en réutilisant nos aperçus SVG en attendant les
 * vraies photos produit.
 */
const PREFIX = "medal:";

export function encodeMedalImage(shape: ProductShape, colors: string[]): string {
  return `${PREFIX}${shape}:${colors.join("|")}`;
}

export function decodeMedalImage(
  image: string
): { shape: ProductShape; colors: string[] } | null {
  if (!image.startsWith(PREFIX)) return null;
  const [, shape, colorPart] = image.split(":");
  return {
    shape: shape as ProductShape,
    colors: colorPart ? colorPart.split("|") : [],
  };
}
