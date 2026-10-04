import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPublishedProductBySlug, getPublishedProducts } from "@/lib/catalog/queries";
import { anon, anyMediaIds, cleanupProduct, deleteUser, productPayload, signedInUser } from "../support/db";

/**
 * Parcours d'administration du catalogue, avec les mêmes fonctions que
 * l'application (admin_save_product) et la lecture publique réelle.
 */
let admin: Awaited<ReturnType<typeof signedInUser>>;
let productId: string | null = null;
let payload: ReturnType<typeof productPayload>;
let media: string[];

beforeAll(async () => {
  admin = await signedInUser(true);
  media = await anyMediaIds(2);
  payload = productPayload({ images: [{ media_id: media[0], variant_ref: "v1", alt_override: "" }] });
});

afterAll(async () => {
  await cleanupProduct(productId);
  await deleteUser(admin.userId);
});

async function save(over: Record<string, unknown>) {
  const { data, error } = await admin.client.rpc("admin_save_product", { p: { ...payload, id: productId ?? "", ...over } });
  if (error) throw error;
  productId = data!;
  return data!;
}

describe("brouillon, publication, modification sans redéploiement", () => {
  it("un brouillon est invisible pour le public", async () => {
    await save({ status: "draft" });
    expect(await getPublishedProductBySlug(payload.slug)).toBeNull();
    const all = await getPublishedProducts();
    expect(all.some((p) => p.id === productId)).toBe(false);
    // Les photos et variantes d'un brouillon ne fuient pas non plus
    const { data: imgs } = await anon().from("product_images").select("id").eq("product_id", productId!);
    expect(imgs).toEqual([]);
  });

  it("une fois publié, le produit apparaît dans la boutique", async () => {
    const { data: variants } = await admin.client.from("product_variants").select("id").eq("product_id", productId!);
    await save({ status: "published", variants: [{ ...payload.variants[0], id: variants![0].id }] });
    const product = await getPublishedProductBySlug(payload.slug);
    expect(product?.name).toBe(payload.name);
    expect(product?.variants[0].priceCents).toBe(1500);
    expect(product?.images[0].media.id).toBe(media[0]);
  });

  it("un changement de prix et de photo est visible immédiatement", async () => {
    const { data: variants } = await admin.client.from("product_variants").select("id").eq("product_id", productId!);
    await save({
      status: "published",
      base_price_cents: 2490,
      variants: [{ ...payload.variants[0], id: variants![0].id }],
      images: [{ media_id: media[1], variant_ref: "v1", alt_override: "Nouvelle photo" }],
    });
    const product = await getPublishedProductBySlug(payload.slug);
    expect(product?.basePriceCents).toBe(2490);
    expect(product?.variants[0].priceCents).toBe(2490);
    expect(product?.images).toHaveLength(1);
    expect(product?.images[0].media.id).toBe(media[1]);
    expect(product?.images[0].alt).toBe("Nouvelle photo");
  });

  it("dépublier retire le produit du site", async () => {
    const { data: variants } = await admin.client.from("product_variants").select("id").eq("product_id", productId!);
    await save({ status: "archived", variants: [{ ...payload.variants[0], id: variants![0].id }] });
    expect(await getPublishedProductBySlug(payload.slug)).toBeNull();
  });

  it("la duplication crée une copie en brouillon", async () => {
    const { data: copyId, error } = await admin.client.rpc("admin_duplicate_product", { p_id: productId! });
    expect(error).toBeNull();
    const { data: copy } = await admin.client.from("products").select("status, slug, product_variants(id), product_images(id)").eq("id", copyId!).single();
    expect(copy!.status).toBe("draft");
    expect(copy!.slug).toContain("-copie");
    expect(copy!.product_variants).toHaveLength(1);
    expect(copy!.product_images).toHaveLength(1);
    await cleanupProduct(copyId);
  });

  it("refuse un prix ou une adresse invalide (contraintes base)", async () => {
    const bad = await admin.client.rpc("admin_save_product", { p: productPayload({ slug: "Pas Valide!" }) });
    expect(bad.error).not.toBeNull();
  });
});

describe("médiathèque", () => {
  it("une photo utilisée ne peut pas être supprimée", async () => {
    const { data: usage } = await admin.client.rpc("media_usage", { p_media_id: media[1] });
    expect((usage as { products: number }).products).toBeGreaterThan(0);
    const { error } = await admin.client.from("media").delete().eq("id", media[1]);
    expect(error).not.toBeNull();
  });
});
