import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { anon, cleanupProduct, deleteUser, productPayload, service, signedInUser } from "../support/db";

/**
 * Règles de sécurité réelles (Supabase local) : RLS, privilèges de colonnes,
 * fonctions réservées au serveur, stockage.
 */
let draftId: string;
let user: Awaited<ReturnType<typeof signedInUser>>;
let admin: Awaited<ReturnType<typeof signedInUser>>;
let orderId: string;

beforeAll(async () => {
  admin = await signedInUser(true);
  user = await signedInUser(false);
  const { data, error } = await admin.client.rpc("admin_save_product", { p: productPayload() });
  if (error) throw error;
  draftId = data!;
  const created = await service().rpc("create_order", {
    p_order: { subtotal_cents: 1500, shipping_cents: 490, total_cents: 1990, shipping_zone_id: "", shipping_zone_name: "Test", shipping_country: "FR" },
    p_items: [{ product_id: draftId, variant_id: "", product_name: "Test", unit_price_cents: 1500, quantity: 1, line_total_cents: 1500, personalization: { name: "JANE" } }],
  });
  if (created.error) throw created.error;
  orderId = created.data![0].order_id;
});

afterAll(async () => {
  await service().from("orders").delete().eq("id", orderId);
  await cleanupProduct(draftId);
  await deleteUser(user.userId);
  await deleteUser(admin.userId);
});

describe("visiteur anonyme", () => {
  it("ne voit pas les brouillons", async () => {
    const { data } = await anon().from("products").select("id").eq("id", draftId);
    expect(data).toEqual([]);
  });
  it("ne voit que des produits publiés", async () => {
    const { data } = await anon().from("products").select("status");
    expect(data!.length).toBeGreaterThan(0);
    expect(data!.every((p) => p.status === "published")).toBe(true);
  });
  it("ne peut pas créer ni modifier de produit", async () => {
    const insert = await anon().from("products").insert({ slug: "pirate", name: "Pirate", base_price_cents: 1 });
    expect(insert.error).not.toBeNull();
    const update = await anon().from("products").update({ base_price_cents: 1 }).neq("id", "00000000-0000-0000-0000-000000000000").select("id");
    expect(update.data ?? []).toEqual([]);
  });
  it("ne peut lire ni commandes, ni messages, ni newsletter, ni événements Stripe", async () => {
    for (const table of ["orders", "order_items", "contact_messages", "newsletter_subscribers", "stripe_events", "rate_limits", "admins"] as const) {
      const { data, error } = await anon().from(table).select("*").limit(1);
      expect(error !== null || (data ?? []).length === 0, table).toBe(true);
    }
  });
  it("ne peut pas appeler les fonctions serveur (commande, paiement)", async () => {
    const r1 = await anon().rpc("create_order", { p_order: {}, p_items: [] });
    expect(r1.error).not.toBeNull();
    const r2 = await anon().rpc("payment_async_succeeded", { p_session_id: "x", p_amount_total: 1 });
    expect(r2.error).not.toBeNull();
  });
  it("ne peut pas envoyer de fichier dans le stockage", async () => {
    const { error } = await anon().storage.from("media").upload(`pirate-${Date.now()}.txt`, new Blob(["x"], { type: "image/png" }));
    expect(error).not.toBeNull();
  });
});

describe("utilisateur connecté NON administrateur", () => {
  it("ne peut pas modifier un produit", async () => {
    const { data } = await user.client.from("products").update({ base_price_cents: 1 }).eq("id", draftId).select("id");
    expect(data ?? []).toEqual([]);
    const { data: check } = await service().from("products").select("base_price_cents").eq("id", draftId).single();
    expect(check!.base_price_cents).toBe(1500);
  });
  it("ne peut pas utiliser la fonction d'enregistrement de l'administration", async () => {
    const { error } = await user.client.rpc("admin_save_product", { p: productPayload() });
    expect(error?.message).toMatch(/forbidden/);
  });
  it("ne voit pas les commandes ni les brouillons", async () => {
    expect((await user.client.from("orders").select("id")).data ?? []).toEqual([]);
    expect((await user.client.from("products").select("id").eq("id", draftId)).data).toEqual([]);
  });
  it("ne peut pas se déclarer administrateur", async () => {
    const { error } = await user.client.from("admins").insert({ user_id: user.userId, display_name: "Pirate" });
    expect(error).not.toBeNull();
  });
  it("ne peut pas envoyer de photo", async () => {
    const { error } = await user.client.storage.from("media").upload(`pirate-${Date.now()}.png`, new Blob(["x"], { type: "image/png" }));
    expect(error).not.toBeNull();
  });
});

describe("administrateur", () => {
  it("voit les commandes et peut gérer la préparation", async () => {
    const { data } = await admin.client.from("orders").select("id").eq("id", orderId);
    expect(data).toHaveLength(1);
    const { error } = await admin.client.from("orders").update({ internal_note: "ok", fulfillment_status: "cancelled" }).eq("id", orderId);
    expect(error).toBeNull();
  });
  it("ne peut PAS déclarer un paiement comme réussi", async () => {
    const { error } = await admin.client.from("orders").update({ payment_status: "paid" }).eq("id", orderId);
    expect(error).not.toBeNull();
    const { data } = await service().from("orders").select("payment_status").eq("id", orderId).single();
    expect(data!.payment_status).toBe("pending");
  });
  it("ne peut pas appeler les fonctions de paiement réservées au serveur", async () => {
    const { error } = await admin.client.rpc("payment_checkout_completed", {
      p_session_id: "x",
      p_payment_intent: "x",
      p_amount_total: 1,
      p_is_paid: true,
      p_customer: {},
    });
    expect(error).not.toBeNull();
  });
});
