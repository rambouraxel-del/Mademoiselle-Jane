import { expect, test, type Page } from "@playwright/test";

/**
 * Mode aperçu visuel (PREVIEW_MODE=true, aucun service externe).
 * Lancement : voir docs/APERCU-VERCEL.md (npm run test:preview).
 */
test.skip(process.env.E2E_PREVIEW !== "1", "Réservé au serveur d'aperçu (E2E_PREVIEW=1)");

/** Échoue si la page contacte un autre site que l'aperçu lui-même. */
function watchExternalRequests(page: Page, baseURL: string) {
  const external: string[] = [];
  const origin = new URL(baseURL).origin;
  page.on("request", (req) => {
    const url = req.url();
    if (!url.startsWith(origin) && !url.startsWith("data:") && !url.startsWith("blob:")) external.push(url);
  });
  return external;
}

async function addToCart(page: Page, slug: string, name: string) {
  await page.goto(`/medailles/${slug}`);
  await page.getByLabel("Prénom de votre animal").fill(name);
  await page.getByRole("button", { name: /Ajouter au panier/ }).click();
  await expect(page.getByText(/Ajouté au panier/)).toBeVisible();
}

test("toutes les pages publiques s'affichent avec les données initiales, sans service externe", async ({ page, baseURL }) => {
  const external = watchExternalRequests(page, baseURL!);
  await page.goto("/");
  await expect(page.getByText(/Aperçu visuel du site/)).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Un petit bijou");
  await expect(page.locator("article")).toHaveCount(3);
  for (const [path, heading] of [
    ["/medailles", "Les médailles"],
    ["/medailles/coeur-rond", "Cœur rond"],
    ["/medailles/fleur-d-amour?finition=argentee", "Fleur d’amour"],
    ["/medailles/coeur-ovale", "Cœur ovale"],
    ["/notre-histoire", "Une histoire"],
    ["/contact", "Contact"],
    ["/infos/livraison", "Livraison"],
    ["/infos/cgv", "Conditions générales de vente"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    // Toutes les photos sont bien chargées
    const broken = await page.evaluate(() =>
      Array.from(document.images).filter((img) => img.complete && img.naturalWidth === 0 && img.loading !== "lazy").map((i) => i.src),
    );
    expect(broken, path).toEqual([]);
  }
  expect(external).toEqual([]);
});

test("filtres, tri et recherche de la boutique", async ({ page }) => {
  await page.goto("/medailles");
  await expect(page.locator("article")).toHaveCount(6);
  await page.getByRole("link", { name: "Fleurs" }).click();
  await expect(page.locator("article")).toHaveCount(2);
  await page.goto("/medailles?finition=argentee");
  await expect(page.locator("article")).toHaveCount(3);
  await page.goto("/medailles?collection=petits-coeurs");
  await expect(page.locator("article")).toHaveCount(6);
  await page.goto("/medailles?q=ovale");
  await expect(page.locator("article")).toHaveCount(2);
  await page.goto("/medailles");
  await page.getByLabel("Trier par").selectOption("prix-decroissant");
  await expect(page.locator("article").first()).toContainText("20,00");
});

test("fiche produit et panier fonctionnent, paiement désactivé", async ({ page }) => {
  await page.goto("/medailles/fleur-d-amour");
  await page.getByText("Argentée", { exact: true }).click();
  await expect(page).toHaveURL(/finition=argentee/);
  await addToCart(page, "coeur-rond", "JANE");
  await addToCart(page, "coeur-rond", "OSCAR");
  await page.goto("/panier");
  await expect(page.getByRole("region", { name: "Articles" }).locator("li")).toHaveCount(2);
  const summary = page.getByRole("complementary", { name: "Récapitulatif de commande" });
  await expect(summary).toContainText("36,00");
  await expect(summary).toContainText("40,90");
  await expect(summary.getByText(/le paiement est désactivé/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Passer au paiement sécurisé" })).toHaveCount(0);
});

test("formulaires désactivés avec un message clair", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Votre nom").fill("Camille");
  await page.getByLabel("Votre e-mail").fill("camille@example.test");
  await page.getByLabel("Votre message").fill("Un message pour tester l’aperçu.");
  await page.getByRole("button", { name: "Envoyer le message" }).click();
  await expect(page.getByRole("status").getByText(/le formulaire est désactivé/)).toBeVisible();

  const footer = page.getByRole("contentinfo");
  await footer.getByLabel("Votre adresse e-mail").fill("news@example.test");
  await footer.getByRole("checkbox").check();
  await footer.getByRole("button", { name: "S’inscrire" }).click();
  await expect(footer.getByText(/newsletter est désactivée/)).toBeVisible();
});

test("administration désactivée et site non indexé", async ({ page, request }) => {
  const res = await page.goto("/admin");
  expect(res?.status()).toBe(403);
  await expect(page.getByRole("heading", { name: "Administration désactivée" })).toBeVisible();
  expect((await request.get("/admin/commandes/export")).status()).toBe(403);
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /");
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect((await request.post("/api/stripe/webhook")).status()).toBe(503);
});

test.describe("mobile 390 × 844", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const path of ["/", "/medailles", "/medailles/coeur-rond", "/notre-histoire", "/contact", "/panier"]) {
    test(`affichage sans débordement : ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
      expect(inner).toBe(390);
      expect(scroll).toBeLessThanOrEqual(390);
    });
  }
});
