import { describe, expect, it } from "vitest";
import { lineKey } from "@/lib/cart/types";
import { validatePersonalization } from "@/lib/cart/personalization";
import { priceCart, type CartInputLine } from "@/lib/checkout/pricing";
import type { Product } from "@/lib/catalog/types";
import type { ShippingZone } from "@/lib/content/queries";

const media = { id: "m1", path: "p.jpg", url: "https://x/p.jpg", width: 10, height: 10, alt: "", focalX: 50, focalY: 50, isPlaceholder: false };

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "coeur-rond",
    name: "Cœur rond",
    shortDescription: "",
    description: "",
    status: "published",
    basePriceCents: 1800,
    shape: "Ronde",
    sizeLabel: "2,5 cm",
    material: "Résine",
    dimensions: "",
    careInfo: "",
    personalizationInfo: "",
    fabricationDelay: "",
    stockMode: "made_to_order",
    isAvailable: true,
    sortOrder: 1,
    isFeatured: true,
    featuredOrder: 1,
    personalization: {
      name: { enabled: true, required: true, maxLength: 12 },
      phone: { enabled: true, required: false, maxLength: 20 },
    },
    storyTitle: "",
    storyText: "",
    storyImage: null,
    seoTitle: "",
    seoDescription: "",
    variants: [
      { id: "22222222-2222-4222-8222-222222222222", name: "Dorée", finish: "doree", swatch: "", priceCents: 1800, stockQuantity: null, isActive: true, sortOrder: 1, sku: "", available: true },
      { id: "33333333-3333-4333-8333-333333333333", name: "Argentée", finish: "argentee", swatch: "", priceCents: 2200, stockQuantity: null, isActive: true, sortOrder: 2, sku: "", available: true },
    ],
    images: [{ id: "i1", media, variantId: null, alt: "", sortOrder: 0 }],
    collections: [],
    updatedAt: "",
    ...overrides,
  };
}

const zones: ShippingZone[] = [{ id: "z1", name: "France", countries: ["FR"], priceCents: 490, freeFromCents: 6000, delayText: "" }];

function line(partial: Partial<CartInputLine>): CartInputLine {
  return {
    key: Math.random().toString(),
    productId: "11111111-1111-4111-8111-111111111111",
    variantId: "22222222-2222-4222-8222-222222222222",
    quantity: 1,
    personalization: { name: "JANE" },
    ...partial,
  };
}

describe("panier : distinction des articles", () => {
  it("sépare deux articles du même modèle si la personnalisation diffère", () => {
    const a = lineKey("p", "v", { name: "JANE" });
    const b = lineKey("p", "v", { name: "OSCAR" });
    expect(a).not.toBe(b);
  });
  it("sépare deux articles si la variante diffère", () => {
    expect(lineKey("p", "v1", { name: "JANE" })).not.toBe(lineKey("p", "v2", { name: "JANE" }));
  });
  it("regroupe deux saisies identiques (espaces normalisés)", () => {
    expect(lineKey("p", "v", { name: " JANE " })).toBe(lineKey("p", "v", { name: "JANE" }));
  });
});

describe("calcul serveur des prix", () => {
  it("utilise le prix de la base, jamais celui envoyé par le navigateur", () => {
    const quote = priceCart(
      [line({ quantity: 2 }), line({ variantId: "33333333-3333-4333-8333-333333333333", personalization: { name: "OSCAR" } })],
      [product()],
      zones,
      "FR",
    );
    expect(quote.valid).toBe(true);
    expect(quote.lines.map((l) => l.unitPriceCents)).toEqual([1800, 2200]);
    expect(quote.subtotalCents).toBe(1800 * 2 + 2200);
    expect(quote.shippingCents).toBe(490);
    expect(quote.totalCents).toBe(5800 + 490);
  });

  it("applique la livraison offerte au-delà du seuil", () => {
    const quote = priceCart([line({ quantity: 4 })], [product()], zones, "FR");
    expect(quote.subtotalCents).toBe(7200);
    expect(quote.shippingCents).toBe(0);
  });

  it("refuse un pays non desservi", () => {
    const quote = priceCart([line({})], [product()], zones, "US");
    expect(quote.valid).toBe(false);
    expect(quote.issues).toContain("Livraison non disponible pour ce pays.");
  });

  it("refuse un produit non publié ou inconnu", () => {
    const quote = priceCart([line({})], [product({ status: "draft" })], zones, "FR");
    expect(quote.valid).toBe(false);
    expect(quote.lines[0].error).toMatch(/plus disponible/);
  });

  it("refuse une variante désactivée ou d'un autre produit", () => {
    const p = product();
    p.variants[0].isActive = false;
    expect(priceCart([line({})], [p], zones, "FR").valid).toBe(false);
    expect(priceCart([line({ variantId: "44444444-4444-4444-8444-444444444444" })], [product()], zones, "FR").valid).toBe(false);
  });

  it("exige le prénom obligatoire et respecte la longueur maximale", () => {
    expect(priceCart([line({ personalization: {} })], [product()], zones, "FR").lines[0].error).toMatch(/prénom/);
    expect(priceCart([line({ personalization: { name: "ABCDEFGHIJKLM" } })], [product()], zones, "FR").lines[0].error).toMatch(/12 caractères/);
  });

  it("ignore un téléphone si l'option est désactivée", () => {
    const p = product();
    p.personalization.phone.enabled = false;
    const quote = priceCart([line({ personalization: { name: "JANE", phone: "0601020304" } })], [p], zones, "FR");
    expect(quote.valid).toBe(true);
    expect(quote.lines[0].personalization).toEqual({ name: "JANE" });
  });

  it("vérifie le stock limité en cumulant les lignes d'une même variante", () => {
    const p = product({ stockMode: "limited" });
    p.variants[0].stockQuantity = 2;
    const ok = priceCart([line({ quantity: 1 }), line({ quantity: 1, personalization: { name: "OSCAR" } })], [p], zones, "FR");
    expect(ok.valid).toBe(true);
    const ko = priceCart([line({ quantity: 2 }), line({ quantity: 1, personalization: { name: "OSCAR" } })], [p], zones, "FR");
    expect(ko.valid).toBe(false);
    expect(ko.lines[0].error).toMatch(/Stock insuffisant/);
  });

  it("refuse une quantité invalide", () => {
    expect(priceCart([line({ quantity: 0 })], [product()], zones, "FR").valid).toBe(false);
    expect(priceCart([line({ quantity: 11 })], [product()], zones, "FR").valid).toBe(false);
  });
});

describe("validation de la personnalisation", () => {
  const config = product().personalization;
  it("accepte les prénoms accentués et composés", () => {
    expect(validatePersonalization(config, { name: "Chloé-Anaïs" }).errors).toEqual({});
  });
  it("refuse les caractères spéciaux et le HTML", () => {
    expect(validatePersonalization(config, { name: "<b>X</b>" }).errors.name).toBeDefined();
  });
  it("valide le format du téléphone", () => {
    expect(validatePersonalization(config, { name: "JANE", phone: "06 01 02 03 04" }).errors).toEqual({});
    expect(validatePersonalization(config, { name: "JANE", phone: "appelez-moi" }).errors.phone).toBeDefined();
  });
});

describe("détection du mode aperçu", () => {
  it("reconnaît les valeurs usuelles, avec espaces, majuscules ou guillemets", async () => {
    const { parsePreviewFlag } = await import("@/lib/preview/mode");
    for (const v of ["true", "TRUE", " True ", '"true"', "'true'", "1", "oui", "yes", "on"]) expect(parsePreviewFlag(v), v).toBe(true);
    for (const v of [undefined, "", "false", "0", "non", "vrai ?"]) expect(parsePreviewFlag(v), String(v)).toBe(false);
  });
});
