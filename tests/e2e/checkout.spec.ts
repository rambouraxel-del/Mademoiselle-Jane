import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import Stripe from "stripe";
import { addToCart, resetRateLimits, service } from "./helpers";

/**
 * Parcours de paiement avec stripe-mock (faux serveur Stripe local) et un
 * webhook signé localement avec STRIPE_WEBHOOK_SECRET. Aucun appel à Stripe.
 */
test.skip(!process.env.STRIPE_MOCK_URL, "stripe-mock non configuré (STRIPE_MOCK_URL)");

function signedRequest(payload: string, secret = process.env.STRIPE_WEBHOOK_SECRET!) {
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
  return { data: payload, headers: { "stripe-signature": header, "content-type": "application/json" } };
}

test("commande payée uniquement après un webhook Stripe signé", async ({ page, request }) => {
  await resetRateLimits();
  const db = service();
  const petName = `NOISETTE${Date.now() % 1000}`.replace(/\d/g, (d) => "ABCDEFGHIJ"[Number(d)]);

  await page.route("https://checkout.stripe.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<h1>Page de paiement Stripe (simulée)</h1>" }),
  );

  await addToCart(page, "coeur-ovale", petName, "argentee");
  await page.goto("/panier");
  await expect(page.getByRole("button", { name: "Passer au paiement sécurisé" })).toBeEnabled();
  await page.getByRole("button", { name: "Passer au paiement sécurisé" }).click();
  await page.waitForURL(/checkout\.stripe\.com/);

  const { data: item } = await db
    .from("order_items")
    .select("order_id")
    .contains("personalization", { name: petName })
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  const { data: order } = await db
    .from("orders")
    .select("id, public_token, total_cents, payment_status, stripe_session_id, order_items(personalization, variant_name)")
    .eq("id", item!.order_id)
    .single();
  const sessionId = order!.stripe_session_id!;
  expect(sessionId).toMatch(/^cs_test_/);
  expect(order!.payment_status).toBe("pending");
  expect(order!.total_cents).toBe(1800 + 490);
  expect(order!.order_items[0].variant_name).toBe("Argentée");

  // La redirection de succès ne prouve rien : la commande reste en attente.
  await page.goto(`/commande/confirmation?ref=${order!.public_token}`);
  await expect(page.getByRole("heading", { name: /Paiement en cours de confirmation/ })).toBeVisible();

  const email = `e2e-${randomUUID().slice(0, 8)}@example.test`;
  const payload = JSON.stringify({
    id: `evt_${randomUUID()}`,
    object: "event",
    type: "checkout.session.completed",
    api_version: "2026-09-30",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: null,
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        payment_status: "paid",
        amount_total: order!.total_cents,
        payment_intent: `pi_${randomUUID()}`,
        customer_details: { email, name: "Claire Test", phone: "+33600000000", address: null },
        collected_information: { shipping_details: { name: "Claire Test", address: { line1: "2 rue du Test", line2: null, postal_code: "69001", city: "Lyon", state: null, country: "FR" } } },
      },
    },
  });

  // Webhook non signé ou mal signé : refusé
  expect((await request.post("/api/stripe/webhook", { data: payload, headers: { "content-type": "application/json" } })).status()).toBe(400);
  expect((await request.post("/api/stripe/webhook", signedRequest(payload, "whsec_mauvais_secret"))).status()).toBe(400);
  const tampered = payload.replace(`"amount_total":${order!.total_cents}`, '"amount_total":1');
  const sig = signedRequest(payload).headers["stripe-signature"];
  expect((await request.post("/api/stripe/webhook", { data: tampered, headers: { "stripe-signature": sig, "content-type": "application/json" } })).status()).toBe(400);

  // Webhook correctement signé : accepté une fois, puis rejeu ignoré
  const ok = await request.post("/api/stripe/webhook", signedRequest(payload));
  expect(ok.status()).toBe(200);
  expect(await ok.text()).toBe("processed");
  const replay = await request.post("/api/stripe/webhook", signedRequest(payload));
  expect(await replay.text()).toBe("already_processed");

  await page.reload();
  await expect(page.getByRole("heading", { name: /Merci Claire/ })).toBeVisible();
  // Le panier est vidé après confirmation
  await expect(page.getByRole("link", { name: /Panier, 0 article/ })).toBeVisible();

  const { data: paid } = await db.from("orders").select("payment_status, customer_email, confirmation_email_sent_at").eq("id", order!.id).single();
  expect(paid!.payment_status).toBe("paid");
  expect(paid!.customer_email).toBe(email);
  expect(paid!.confirmation_email_sent_at).not.toBeNull();
});
