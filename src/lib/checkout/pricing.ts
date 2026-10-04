import { validatePersonalization } from "@/lib/cart/personalization";
import { MAX_CART_LINES, MAX_QUANTITY_PER_LINE, type Personalization } from "@/lib/cart/types";
import { imageForVariant } from "@/lib/catalog/map";
import type { Product } from "@/lib/catalog/types";
import type { ShippingZone } from "@/lib/content/queries";

export type CartInputLine = {
  key: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  personalization: Personalization;
};

export type PricedLine = {
  key: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productSlug: string;
  variantName: string;
  sizeLabel: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  personalization: Personalization;
  imagePath: string | null;
  imageUrl: string | null;
  stockLimited: boolean;
  error: string | null;
};

export type Quote = {
  lines: PricedLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  zone: ShippingZone | null;
  country: string;
  issues: string[];
  valid: boolean;
};

/**
 * Calcul fiable d'un panier à partir des données de la base (et non du navigateur) :
 * produit publié et disponible, variante active, stock, personnalisation,
 * prix unitaire, frais de livraison selon la zone.
 */
export function priceCart(
  input: CartInputLine[],
  products: Product[],
  zones: ShippingZone[],
  country: string,
): Quote {
  const issues: string[] = [];
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: PricedLine[] = [];

  if (input.length === 0) issues.push("Votre panier est vide.");
  if (input.length > MAX_CART_LINES) issues.push("Votre panier contient trop d’articles.");

  for (const raw of input.slice(0, MAX_CART_LINES)) {
    const product = byId.get(raw.productId);
    const quantity = Number.isInteger(raw.quantity) ? raw.quantity : 0;
    const base: Omit<PricedLine, "error"> = {
      key: raw.key,
      productId: raw.productId,
      variantId: raw.variantId,
      productName: product?.name ?? "Produit indisponible",
      productSlug: product?.slug ?? "",
      variantName: "",
      sizeLabel: product?.sizeLabel ?? "",
      unitPriceCents: 0,
      quantity,
      lineTotalCents: 0,
      personalization: raw.personalization ?? {},
      imagePath: null,
      imageUrl: null,
      stockLimited: false,
    };
    if (!product || product.status !== "published") {
      lines.push({ ...base, error: "Ce produit n’est plus disponible." });
      continue;
    }
    const activeVariants = product.variants.filter((v) => v.isActive);
    const variant = raw.variantId ? product.variants.find((v) => v.id === raw.variantId) : null;
    if (activeVariants.length > 0 && (!variant || !variant.isActive)) {
      lines.push({ ...base, error: "Cette finition n’est plus disponible." });
      continue;
    }
    if (activeVariants.length === 0 && raw.variantId) {
      lines.push({ ...base, error: "Cette finition n’est plus disponible." });
      continue;
    }
    const image = imageForVariant(product, variant?.id ?? null);
    const unit = variant?.priceCents ?? product.basePriceCents;
    const priced = {
      ...base,
      variantName: variant?.name ?? "",
      unitPriceCents: unit,
      lineTotalCents: unit * Math.max(0, quantity),
      imagePath: image?.media.path ?? null,
      imageUrl: image?.media.url ?? null,
      stockLimited: product.stockMode === "limited",
    };
    if (quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      lines.push({ ...priced, error: `Quantité invalide (1 à ${MAX_QUANTITY_PER_LINE}).` });
      continue;
    }
    if (!product.isAvailable || (variant && !variant.available)) {
      lines.push({ ...priced, error: "Ce produit est momentanément indisponible." });
      continue;
    }
    const { value, errors } = validatePersonalization(product.personalization, raw.personalization ?? {});
    if (Object.keys(errors).length > 0) {
      lines.push({ ...priced, personalization: value, error: Object.values(errors).join(" ") });
      continue;
    }
    lines.push({ ...priced, personalization: value, error: null });
  }

  // Stock limité : quantités cumulées par variante
  const needed = new Map<string, number>();
  for (const l of lines) if (!l.error && l.stockLimited && l.variantId) needed.set(l.variantId, (needed.get(l.variantId) ?? 0) + l.quantity);
  for (const [variantId, qty] of needed) {
    const product = products.find((p) => p.variants.some((v) => v.id === variantId));
    const stock = product?.variants.find((v) => v.id === variantId)?.stockQuantity ?? 0;
    if (qty > stock) {
      for (const l of lines) {
        if (l.variantId === variantId && !l.error) {
          l.error = stock > 0 ? `Stock insuffisant : ${stock} disponible${stock > 1 ? "s" : ""} au total.` : "Rupture de stock.";
        }
      }
    }
  }

  const subtotal = lines.filter((l) => !l.error).reduce((s, l) => s + l.lineTotalCents, 0);
  const normalizedCountry = country.toUpperCase();
  const zone = zones.find((z) => z.countries.includes(normalizedCountry)) ?? null;
  if (!zone) issues.push("Livraison non disponible pour ce pays.");
  const shipping = zone ? (zone.freeFromCents !== null && subtotal >= zone.freeFromCents ? 0 : zone.priceCents) : 0;
  if (lines.some((l) => l.error)) issues.push("Certains articles doivent être corrigés ou retirés.");

  return {
    lines,
    subtotalCents: subtotal,
    shippingCents: shipping,
    totalCents: subtotal + shipping,
    zone,
    country: normalizedCountry,
    issues,
    valid: issues.length === 0 && lines.length > 0,
  };
}
