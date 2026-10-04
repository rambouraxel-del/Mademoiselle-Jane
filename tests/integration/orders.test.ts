import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createCheckout } from "@/lib/checkout/checkout";
import { processStripeEvent } from "@/lib/payments/webhook";
import { anyMediaIds, cleanupProduct, deleteUser, productPayload, service, signedInUser } from "../support/db";

/**
 * Commandes, stock et webhooks Stripe sur la base locale.
 * Les événements sont construits localement (pas d'appel à Stripe) ;
 * la vérification de signature HTTP est testée dans les tests de bout en bout.
 */
const db = service();
let admin: Awaited<ReturnType<typeof signedInUser>>;
let productId: string;
let variantId: string;
let slug: string;
const createdOrders: string[] = [];

async function mailCount(to: string): Promise<number> {
  const res = await fetch(`http://127.0.0.1:54324/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`);
  if (!res.ok) throw new Error("Mailpit indisponible");
  const json = (await res.json()) as { messages_count: number };
  return json.messages_count;
}

async function newOrder(quantity = 1, limited = false) {
  const { data, error } = await db.rpc("create_order", {
    p_order: { subtotal_cents: 1500 * quantity, shipping_cents: 490, total_cents: 1500 * quantity + 490, shipping_zone_id: "", shipping_zone_name: "France", shipping_country: "FR" },
    p_items: [
      {
        product_id: productId,
        variant_id: variantId,
        product_name: "Médaille test",
        product_slug: slug,
        variant_name: "Dorée",
        size_label: "2,5 cm",
        unit_price_cents: 1500,
        quantity,
        line_total_cents: 1500 * quantity,
        personalization: { name: "JANE", phone: "0601020304" },
        stock_limited: limited,
      },
    ],
  });
  if (error) throw error;
  const order = data![0];
  createdOrders.push(order.order_id);
  const sessionId = `cs_test_${randomUUID()}`;
  await db.from("orders").update({ stripe_session_id: sessionId }).eq("id", order.order_id);
  return { ...order, sessionId };
}

function event(type: string, object: Record<string, unknown>, id = `evt_${randomUUID()}`): Stripe.Event {
  return { id, type, object: "event", data: { object }, api_version: "test", created: 0, livemode: false, pending_webhooks: 0, request: null } as unknown as Stripe.Event;
}

function completedSession(sessionId: string, amount: number, email: string, paid = true) {
  return {
    id: sessionId,
    object: "checkout.session",
    payment_status: paid ? "paid" : "unpaid",
    amount_total: amount,
    payment_intent: `pi_${randomUUID()}`,
    customer_details: { email, name: "Camille Test", phone: "+33600000000", address: null },
    collected_information: {
      shipping_details: { name: "Camille Test", address: { line1: "1 rue des Fleurs", line2: null, postal_code: "75001", city: "Paris", state: null, country: "FR" } },
    },
  };
}

beforeAll(async () => {
  admin = await signedInUser(true);
  const media = await anyMediaIds(1);
  const payload = productPayload({ status: "published", images: [{ media_id: media[0], variant_ref: "v1", alt_override: "" }] });
  slug = payload.slug;
  const { data, error } = await admin.client.rpc("admin_save_product", { p: payload });
  if (error) throw error;
  productId = data!;
  const { data: v } = await db.from("product_variants").select("id").eq("product_id", productId).single();
  variantId = v!.id;
});

afterAll(async () => {
  if (createdOrders.length) await db.from("orders").delete().in("id", createdOrders);
  await cleanupProduct(productId);
  await deleteUser(admin.userId);
});

describe("instantané des commandes", () => {
  it("une commande garde nom, prix, variante et personnalisation après modification du produit", async () => {
    const order = await newOrder();
    await db.from("products").update({ name: "Nom modifié", base_price_cents: 9900 }).eq("id", productId);
    await db.from("product_variants").update({ name: "Renommée", price_cents: 9900 }).eq("id", variantId);
    const { data } = await db.from("order_items").select("*").eq("order_id", order.order_id).single();
    expect(data!.product_name).toBe("Médaille test");
    expect(data!.variant_name).toBe("Dorée");
    expect(data!.unit_price_cents).toBe(1500);
    expect(data!.personalization).toEqual({ name: "JANE", phone: "0601020304" });
    await db.from("product_variants").update({ name: "Dorée", price_cents: null }).eq("id", variantId);
    await db.from("products").update({ name: "Médaille test", base_price_cents: 1500 }).eq("id", productId);
  });

  it("le numéro et le jeton public sont uniques et non devinables", async () => {
    const a = await newOrder();
    const b = await newOrder();
    expect(a.order_number).not.toBe(b.order_number);
    expect(a.public_token).toMatch(/^[0-9a-f]{48}$/);
    expect(a.public_token).not.toBe(b.public_token);
  });
});

describe("stock limité", () => {
  it("réserve le stock, refuse la survente et le remet en vente à l'expiration (une seule fois)", async () => {
    await db.from("products").update({ stock_mode: "limited" }).eq("id", productId);
    await db.from("product_variants").update({ stock_quantity: 1 }).eq("id", variantId);

    const first = await newOrder(1, true);
    let { data: v } = await db.from("product_variants").select("stock_quantity").eq("id", variantId).single();
    expect(v!.stock_quantity).toBe(0);

    await expect(newOrder(1, true)).rejects.toMatchObject({ message: expect.stringContaining("insufficient_stock") });

    const expired = event("checkout.session.expired", { id: first.sessionId, object: "checkout.session" });
    expect((await processStripeEvent(expired)).status).toBe(200);
    ({ data: v } = await db.from("product_variants").select("stock_quantity").eq("id", variantId).single());
    expect(v!.stock_quantity).toBe(1);

    // Rejeu du même événement + événement différent pour la même session : pas de double remise en stock
    expect((await processStripeEvent(expired)).body).toBe("already_processed");
    await processStripeEvent(event("checkout.session.expired", { id: first.sessionId, object: "checkout.session" }));
    ({ data: v } = await db.from("product_variants").select("stock_quantity").eq("id", variantId).single());
    expect(v!.stock_quantity).toBe(1);

    const { data: o } = await db.from("orders").select("payment_status").eq("id", first.order_id).single();
    expect(o!.payment_status).toBe("expired");
    await db.from("products").update({ stock_mode: "made_to_order" }).eq("id", productId);
    await db.from("product_variants").update({ stock_quantity: null }).eq("id", variantId);
  });
});

describe("webhooks Stripe", () => {
  it("confirme le paiement, enregistre le client et n'envoie l'email qu'une fois malgré les rejeux", async () => {
    const order = await newOrder();
    const email = `client-${randomUUID().slice(0, 8)}@example.test`;
    const evt = event("checkout.session.completed", completedSession(order.sessionId, 1990, email));

    const r1 = await processStripeEvent(evt);
    expect(r1).toEqual({ status: 200, body: "processed" });
    const r2 = await processStripeEvent(evt);
    expect(r2.body).toBe("already_processed");
    // Même session, autre identifiant d'événement (ex. événement asynchrone tardif)
    await processStripeEvent(event("checkout.session.async_payment_succeeded", { id: order.sessionId, object: "checkout.session", amount_total: 1990 }));

    const { data } = await db.from("orders").select("*").eq("id", order.order_id).single();
    expect(data!.payment_status).toBe("paid");
    expect(data!.paid_at).not.toBeNull();
    expect(data!.customer_email).toBe(email);
    expect((data!.shipping_address as { city: string }).city).toBe("Paris");
    expect(data!.confirmation_email_sent_at).not.toBeNull();
    await new Promise((r) => setTimeout(r, 500));
    expect(await mailCount(email)).toBe(1);
  });

  it("met la commande « à vérifier » si le montant reçu diffère", async () => {
    const order = await newOrder();
    await processStripeEvent(event("checkout.session.completed", completedSession(order.sessionId, 100, "x@example.test")));
    const { data } = await db.from("orders").select("payment_status, confirmation_email_sent_at").eq("id", order.order_id).single();
    expect(data!.payment_status).toBe("review");
    expect(data!.confirmation_email_sent_at).toBeNull();
  });

  it("gère un paiement différé : en cours puis échoué", async () => {
    const order = await newOrder();
    await processStripeEvent(event("checkout.session.completed", completedSession(order.sessionId, 1990, "y@example.test", false)));
    let { data } = await db.from("orders").select("payment_status").eq("id", order.order_id).single();
    expect(data!.payment_status).toBe("processing");
    await processStripeEvent(event("checkout.session.async_payment_failed", { id: order.sessionId, object: "checkout.session" }));
    ({ data } = await db.from("orders").select("payment_status").eq("id", order.order_id).single());
    expect(data!.payment_status).toBe("failed");
  });

  it("ignore proprement une session inconnue (autre boutique sur le même compte Stripe)", async () => {
    const r = await processStripeEvent(event("checkout.session.completed", completedSession("cs_unknown", 1, "z@example.test")));
    expect(r).toEqual({ status: 200, body: "ignored_unknown_order" });
  });

  it("un remboursement complet est reflété sur la commande", async () => {
    const order = await newOrder();
    const session = completedSession(order.sessionId, 1990, "r@example.test");
    await processStripeEvent(event("checkout.session.completed", session));
    await processStripeEvent(event("charge.refunded", { id: "ch_1", object: "charge", payment_intent: session.payment_intent, amount: 1990, amount_refunded: 1990 }));
    const { data } = await db.from("orders").select("payment_status").eq("id", order.order_id).single();
    expect(data!.payment_status).toBe("refunded");
  });
});

describe("création de la session de paiement", () => {
  const cartLine = (name: string) => ({
    key: name,
    productId,
    variantId,
    quantity: 1,
    personalization: { name },
  });

  it("calcule les montants côté serveur et enregistre la commande avant Stripe", async () => {
    let captured: Stripe.Checkout.SessionCreateParams | null = null;
    const fakeStripe = {
      checkout: {
        sessions: {
          create: async (params: Stripe.Checkout.SessionCreateParams) => {
            captured = params;
            return { id: `cs_test_${randomUUID()}`, url: "https://checkout.stripe.com/c/pay/test" };
          },
        },
      },
    } as unknown as Pick<Stripe, "checkout">;

    const result = await createCheckout([cartLine("JANE"), cartLine("OSCAR")], "FR", fakeStripe);
    expect(result.ok).toBe(true);
    const params = captured! as Stripe.Checkout.SessionCreateParams;
    expect(params.line_items).toHaveLength(2);
    expect(params.line_items!.map((l) => l.price_data!.unit_amount)).toEqual([1500, 1500]);
    expect(params.shipping_options![0].shipping_rate_data!.fixed_amount!.amount).toBe(490);
    expect(params.shipping_address_collection!.allowed_countries).toEqual(["FR"]);

    const orderId = String(params.metadata!.order_id);
    createdOrders.push(orderId);
    const { data } = await db.from("orders").select("total_cents, payment_status, stripe_session_id, order_items(personalization)").eq("id", orderId).single();
    expect(data!.total_cents).toBe(3490);
    expect(data!.payment_status).toBe("pending");
    expect(data!.stripe_session_id).toMatch(/^cs_test_/);
    expect(data!.order_items.map((i) => (i.personalization as { name: string }).name).sort()).toEqual(["JANE", "OSCAR"]);
  });

  it("annule la commande et libère le stock si Stripe échoue", async () => {
    const failing = { checkout: { sessions: { create: async () => { throw new Error("stripe down"); } } } } as unknown as Pick<Stripe, "checkout">;
    const before = await db.from("orders").select("id").order("created_at", { ascending: false }).limit(1).single();
    const result = await createCheckout([cartLine("JANE")], "FR", failing);
    expect(result.ok).toBe(false);
    const { data } = await db.from("orders").select("id, payment_status").order("created_at", { ascending: false }).limit(1).single();
    expect(data!.id).not.toBe(before.data!.id);
    createdOrders.push(data!.id);
    expect(data!.payment_status).toBe("cancelled");
  });

  it("refuse un panier invalide sans créer de commande", async () => {
    const result = await createCheckout([cartLine("<script>")], "FR", null);
    expect(result.ok).toBe(false);
  });

  it("produit des paramètres acceptés par l'API Stripe (serveur stripe-mock)", async () => {
    const mock = process.env.STRIPE_MOCK_URL;
    if (!mock) return; // stripe-mock non lancé : test ignoré
    const { default: StripeSdk } = await import("stripe");
    const u = new URL(mock);
    const stripe = new StripeSdk("sk_test_mock", { host: u.hostname, port: u.port, protocol: "http" });
    const result = await createCheckout([cartLine("JANE")], "FR", stripe);
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    expect(result.url).toMatch(/^https:\/\//);
    const { data } = await db.from("orders").select("id, stripe_session_id").eq("order_number", result.orderNumber).single();
    expect(data!.stripe_session_id).toMatch(/^cs_/);
    createdOrders.push(data!.id);
  });
});
