export type Personalization = {
  name?: string;
  phone?: string;
};

/** Ligne de panier conservée dans le navigateur. Les prix y sont indicatifs :
 *  le serveur recalcule tout à partir de la base avant le paiement. */
export type CartLine = {
  key: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  personalization: Personalization;
  display: {
    productName: string;
    variantName: string;
    slug: string;
    imageUrl: string | null;
    unitPriceCents: number;
    sizeLabel: string;
  };
};

export const MAX_QUANTITY_PER_LINE = 10;
export const MAX_CART_LINES = 30;

export function normalizePersonalization(p: Personalization): Personalization {
  const out: Personalization = {};
  const name = p.name?.replace(/\s+/g, " ").trim();
  const phone = p.phone?.replace(/\s+/g, " ").trim();
  if (name) out.name = name;
  if (phone) out.phone = phone;
  return out;
}

/** Deux articles ne sont regroupés que si produit, variante ET personnalisation sont identiques. */
export function lineKey(productId: string, variantId: string | null, personalization: Personalization): string {
  const p = normalizePersonalization(personalization);
  return JSON.stringify([productId, variantId ?? "", p.name ?? "", p.phone ?? ""]);
}
