import path from "node:path";
import { expect, test } from "@playwright/test";
import { deleteUser } from "../support/db";
import { loginAdmin, resetRateLimits, service } from "./helpers";

/**
 * Parcours d'administration réels dans le navigateur.
 * Comptes créés pour le test puis supprimés (aucun mot de passe en dur dans l'application).
 */
const PASSWORD = `E2e-${Date.now()}-Motdepasse!`;
let adminEmail = "";
let adminId = "";

test.beforeAll(async () => {
  const db = service();
  adminEmail = `e2e-admin-${Date.now()}@example.test`;
  const { data, error } = await db.auth.admin.createUser({ email: adminEmail, password: PASSWORD, email_confirm: true });
  if (error) throw error;
  adminId = data.user.id;
  await db.from("admins").insert({ user_id: adminId, display_name: "Ophélie" });
});

test.afterAll(async () => {
  await deleteUser(adminId);
});

test.beforeEach(async () => {
  await resetRateLimits();
});

test("un compte non administrateur est refusé", async ({ page }) => {
  const db = service();
  const email = `e2e-user-${Date.now()}@example.test`;
  const { data } = await db.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true });
  await loginAdmin(page, email, PASSWORD);
  await expect(page.getByText("Ce compte n’a pas accès à l’administration.")).toBeVisible();
  await page.goto("/admin/produits");
  await expect(page).toHaveURL(/\/admin\/connexion/);
  await deleteUser(data.user!.id);
});

test("les pages d'administration exigent une connexion", async ({ page, request }) => {
  await page.goto("/admin/commandes");
  await expect(page).toHaveURL(/\/admin\/connexion/);
  const csv = await request.get("/admin/commandes/export", { maxRedirects: 0 });
  expect([302, 303, 307, 403]).toContain(csv.status());
});

test("brouillon invisible, publication, prix et photo modifiés sans redéploiement", async ({ page }) => {
  test.setTimeout(120_000);
  const name = `Os câlin ${Date.now()}`;
  await loginAdmin(page, adminEmail, PASSWORD);
  await expect(page.getByRole("heading", { name: /Bonjour Ophélie/ })).toBeVisible();

  // Création d'un brouillon avec une photo importée depuis l'ordinateur
  await page.goto("/admin/produits/nouveau");
  await page.getByLabel("Nom du produit").fill(name);
  await page.getByLabel("Prix de base (€)").fill("22,00");
  await page.getByRole("button", { name: "+ Ajouter une finition" }).click();
  await page.getByLabel("Nom", { exact: true }).fill("Dorée");
  await page.getByRole("button", { name: "+ Ajouter des photos" }).click();
  const dialog = page.getByRole("dialog", { name: "Ajouter des photos" });
  await dialog.getByLabel("Choisir des photos à importer").setInputFiles(path.join(process.cwd(), "public/media-initiales/coeur-rond-dore.jpg"));
  await expect(dialog.getByText("1 sélectionnée(s)")).toBeVisible({ timeout: 30_000 });
  await dialog.getByRole("button", { name: "Utiliser ces photos" }).click();
  await page.getByRole("button", { name: "Enregistrer le brouillon" }).click();
  await page.waitForURL(/\/admin\/produits\/[0-9a-f-]{36}\?ok=cree/);
  await expect(page.getByText("Produit créé en brouillon")).toBeVisible();
  const productId = page.url().match(/produits\/([0-9a-f-]{36})/)![1];
  const { data: row } = await service().from("products").select("slug").eq("id", productId).single();
  const slug = row!.slug;

  // Invisible pour le public
  const hidden = await page.request.get(`/medailles/${slug}`);
  expect(hidden.status()).toBe(404);
  await page.goto("/medailles");
  await expect(page.getByText(name)).toHaveCount(0);

  // Aperçu privé disponible pour l'administratrice
  await page.goto(`/admin/produits/${productId}/apercu`);
  await expect(page.getByText(/Aperçu privé — non visible par le public/)).toBeVisible();
  await expect(page.getByRole("heading", { name })).toBeVisible();

  // Publication
  await page.goto(`/admin/produits/${productId}`);
  await page.getByRole("button", { name: "Publier" }).click();
  await expect(page.getByText("Produit publié : il est visible dans la boutique.")).toBeVisible();
  await page.goto(`/medailles/${slug}`);
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.locator("main")).toContainText("22,00");
  const firstSrc = await page.locator("main img").first().getAttribute("src");
  await page.goto("/medailles");
  await expect(page.getByText(`${name} — Dorée`)).toBeVisible();

  // Modification du prix et remplacement de la photo
  await page.goto(`/admin/produits/${productId}`);
  await page.getByLabel("Prix de base (€)").fill("24,50");
  await page.getByRole("button", { name: "Remplacer" }).first().click();
  const picker = page.getByRole("dialog", { name: "Choisir une photo" });
  await picker.locator("ul li button").nth(3).click();
  await picker.getByRole("button", { name: "Utiliser cette photo" }).click();
  await page.getByRole("button", { name: "Enregistrer et mettre à jour le site" }).click();
  await expect(page.getByText("Modifications publiées sur le site.")).toBeVisible();
  await page.goto(`/medailles/${slug}`);
  await expect(page.locator("main")).toContainText("24,50");
  const newSrc = await page.locator("main img").first().getAttribute("src");
  expect(newSrc).not.toBe(firstSrc);

  // Archivage : retiré du site
  await page.goto(`/admin/produits/${productId}`);
  await page.getByRole("button", { name: "Archiver" }).click();
  await expect(page.getByText("Produit archivé")).toBeVisible();
  expect((await page.request.get(`/medailles/${slug}`)).status()).toBe(404);
  await service().from("products").delete().eq("id", productId);
});

test("modifier un texte du site le publie immédiatement", async ({ page }) => {
  await loginAdmin(page, adminEmail, PASSWORD);
  await page.waitForURL(/\/admin$/);
  await page.goto("/admin/contenus/general");
  const field = page.getByLabel("Texte du bandeau");
  const original = await field.inputValue();
  await field.fill("Livraison offerte ce week-end (test)");
  await page.getByRole("button", { name: "Enregistrer et publier" }).click();
  await expect(page.getByText("Contenus enregistrés et publiés sur le site.")).toBeVisible();
  await page.goto("/");
  await expect(page.getByText("Livraison offerte ce week-end (test)")).toBeVisible();
  await page.goto("/admin/contenus/general");
  await page.getByLabel("Texte du bandeau").fill(original);
  await page.getByRole("button", { name: "Enregistrer et publier" }).click();
  await expect(page.getByText("Contenus enregistrés et publiés sur le site.")).toBeVisible();
});

test("commandes, export CSV et messages", async ({ page }) => {
  // Données propres au test : une commande payée (via les fonctions serveur) et un message
  const db = service();
  const { data: product } = await db.from("products").select("id, name, product_variants(id, name)").eq("slug", "coeur-rond").single();
  const { data: created } = await db.rpc("create_order", {
    p_order: { subtotal_cents: 1800, shipping_cents: 490, total_cents: 2290, shipping_zone_id: "", shipping_zone_name: "France", shipping_country: "FR" },
    p_items: [{ product_id: product!.id, variant_id: product!.product_variants[0].id, product_name: product!.name, variant_name: product!.product_variants[0].name, unit_price_cents: 1800, quantity: 1, line_total_cents: 1800, personalization: { name: "PRALINE" } }],
  });
  const session = `cs_test_admin_${Date.now()}`;
  await db.from("orders").update({ stripe_session_id: session }).eq("id", created![0].order_id);
  await db.rpc("payment_checkout_completed", { p_session_id: session, p_payment_intent: "pi_test", p_amount_total: 2290, p_is_paid: true, p_customer: { email: "praline@example.test", name: "Camille Test" } });
  await db.from("contact_messages").insert({ name: "Camille Test", email: "camille@example.test", message: "Bonjour, une question sur la Fleur d’amour." });

  await loginAdmin(page, adminEmail, PASSWORD);
  await page.waitForURL(/\/admin$/);
  await page.goto("/admin/commandes?paiement=paid");
  await expect(page.locator("main ul li").getByText("Payée", { exact: true }).first()).toBeVisible();
  const csv = await page.request.get("/admin/commandes/export?paiement=paid");
  expect(csv.status()).toBe(200);
  const text = await csv.text();
  expect(text).toContain("Prénoms gravés");
  expect(text).toContain("PRALINE");
  await page.goto("/admin/messages");
  await expect(page.getByText("Camille Test").first()).toBeVisible();
});

test.describe("administration sur téléphone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test("navigation et absence de débordement", async ({ page }) => {
    await loginAdmin(page, adminEmail, PASSWORD);
    await page.waitForURL(/\/admin$/);
    await page.getByRole("button", { name: "Menu de l’administration" }).click();
    await page.locator("#admin-menu").getByRole("link", { name: "Produits" }).click();
    await expect(page).toHaveURL(/\/admin\/produits/);
    for (const p of ["/admin", "/admin/produits", "/admin/commandes", "/admin/medias", "/admin/contenus/home"]) {
      await page.goto(p);
      const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
      expect(inner, p).toBe(390);
      expect(scroll, p).toBeLessThanOrEqual(390);
    }
  });
});

