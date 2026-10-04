import { expect, test } from "@playwright/test";
import { addToCart, noHorizontalOverflow, resetRateLimits } from "./helpers";

test.beforeEach(async () => {
  await resetRateLimits();
});

test("accueil : identité et produits mis en avant", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("img", { name: "Mademoizelle Jane" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Un petit bijou");
  await expect(page.getByRole("heading", { name: "Les petits coups de cœur" })).toBeVisible();
  await expect(page.locator("article")).toHaveCount(3);
});

test("boutique : six déclinaisons, filtres, tri et recherche", async ({ page }) => {
  await page.goto("/medailles");
  await expect(page.locator("article")).toHaveCount(6);
  await page.getByRole("link", { name: "Fleurs" }).click();
  await expect(page).toHaveURL(/forme=fleur/);
  await expect(page.locator("article")).toHaveCount(2);
  await page.goto("/medailles?finition=argentee");
  await expect(page.locator("article")).toHaveCount(3);
  await page.goto("/medailles?q=ovale");
  await expect(page.locator("article")).toHaveCount(2);
  await page.goto("/medailles");
  await page.getByLabel("Trier par").selectOption("prix-decroissant");
  await expect(page).toHaveURL(/tri=prix-decroissant/);
  await expect(page.locator("article").first()).toContainText("20,00");
});

test("panier : deux personnalisations différentes = deux articles, prix recalculés par le serveur", async ({ page }) => {
  await addToCart(page, "coeur-rond", "JANE");
  await addToCart(page, "coeur-rond", "OSCAR");
  await addToCart(page, "coeur-rond", "JANE"); // même saisie : regroupée
  await page.goto("/panier");
  const items = page.getByRole("region", { name: "Articles" }).locator("li");
  await expect(items).toHaveCount(2);
  await expect(page.getByText("JANE", { exact: true })).toBeVisible();
  await expect(page.getByText("OSCAR", { exact: true })).toBeVisible();
  const summary = page.getByRole("complementary", { name: "Récapitulatif de commande" });
  await expect(summary).toContainText("54,00"); // 3 × 18,00
  await expect(summary).toContainText("4,90");
  await expect(summary).toContainText("58,90");
});

test("panier : un prix falsifié dans le navigateur est ignoré", async ({ page }) => {
  await addToCart(page, "fleur-d-amour", "LUNA");
  await page.evaluate(() => {
    const lines = JSON.parse(localStorage.getItem("mj-cart-v1") ?? "[]");
    for (const l of lines) l.display.unitPriceCents = 1;
    localStorage.setItem("mj-cart-v1", JSON.stringify(lines));
  });
  await page.goto("/panier");
  const summary = page.getByRole("complementary", { name: "Récapitulatif de commande" });
  await expect(summary).toContainText("20,00");
  await expect(summary).toContainText("24,90");
});

test("fiche produit : personnalisation obligatoire et récapitulatif", async ({ page }) => {
  await page.goto("/medailles/fleur-d-amour?finition=argentee");
  await page.getByRole("button", { name: /Ajouter au panier/ }).click();
  await expect(page.getByText("Indiquez le prénom de votre animal.")).toBeVisible();
  await page.getByLabel("Prénom de votre animal").fill("Mila");
  await expect(page.getByText("Récapitulatif", { exact: true })).toBeVisible();
  await expect(page.locator("dl").filter({ hasText: "Modèle" })).toContainText("Fleur d’amour — Argentée");
  await expect(page.locator("dl").filter({ hasText: "Modèle" })).toContainText("Mila");
});

test("contact : un message valide est enregistré", async ({ page }) => {
  const unique = `Message de test ${Date.now()}`;
  await page.goto("/contact");
  await page.getByLabel("Votre nom").fill("Camille Test");
  await page.getByLabel("Votre e-mail").fill("camille@example.test");
  await page.getByLabel("Votre message").fill(unique);
  await page.waitForTimeout(2600); // protection anti-robot : envoi trop rapide refusé
  await page.getByRole("button", { name: "Envoyer le message" }).click();
  await expect(page.getByText("Merci, votre message a bien été envoyé.")).toBeVisible();
  const { service } = await import("./helpers");
  const { data } = await service().from("contact_messages").select("name").eq("message", unique);
  expect(data).toHaveLength(1);
});

test("contact : un envoi immédiat (robot) est refusé", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Votre nom").fill("Robot");
  await page.getByLabel("Votre e-mail").fill("robot@example.test");
  await page.getByLabel("Votre message").fill("Message envoyé trop vite par un robot");
  await page.getByRole("button", { name: "Envoyer le message" }).click();
  await expect(page.getByText(/envoyé trop vite/)).toBeVisible();
});

test("pages d'informations et 404", async ({ page }) => {
  await page.goto("/infos/mentions-legales");
  await expect(page.getByText("Page en cours de rédaction.")).toBeVisible();
  await expect(page.getByText(/SIRET : \[SIRET : à compléter\]/)).toBeVisible();
  const res = await page.goto("/medailles/n-existe-pas");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("Cette page s’est égarée…")).toBeVisible();
});

test.describe("mobile 390 × 844", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const path of ["/", "/medailles", "/medailles/coeur-rond", "/notre-histoire", "/contact", "/panier", "/infos/cgv"]) {
    test(`pas de débordement horizontal sur ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await noHorizontalOverflow(page);
    });
  }
  test("menu mobile", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await page.getByRole("navigation", { name: "Navigation mobile" }).getByRole("link", { name: "Notre histoire" }).click();
    await expect(page).toHaveURL(/notre-histoire/);
  });
});
