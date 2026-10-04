/**
 * Captures de validation visuelle (ordinateur 1440 px et mobile 390 × 844).
 *   node scripts/captures.mjs [dossier] [url_de_base]
 * Variables facultatives : PLAYWRIGHT_CHROMIUM_PATH, CAPTURE_ADMIN_EMAIL, CAPTURE_ADMIN_PASSWORD.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const out = process.argv[2] ?? "docs/captures";
const base = process.argv[3] ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });

const pages = [
  ["accueil", "/"],
  ["boutique", "/medailles"],
  ["produit-coeur-rond", "/medailles/coeur-rond"],
  ["produit-fleur-amour", "/medailles/fleur-d-amour?finition=argentee"],
  ["notre-histoire", "/notre-histoire"],
  ["contact-faq", "/contact"],
  ["livraison", "/infos/livraison"],
  ["panier-vide", "/panier"],
  ["suivi-commande", "/commande/suivi"],
  ["page-404", "/page-inexistante"],
];

async function settle(page) {
  // Fait défiler la page pour charger les images différées, puis revient en haut.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
}

const shot = (page, file, fullPage = true) => page.screenshot({ path: file, fullPage, type: "jpeg", quality: 82 });

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
);
for (const [device, viewport, extra] of [
  ["desktop", { width: 1440, height: 900 }, {}],
  ["mobile", { width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
]) {
  const context = await browser.newContext({ viewport, locale: "fr-FR", ...extra });
  const page = await context.newPage();
  for (const [name, path] of pages) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await settle(page);
    await shot(page, `${out}/${device}-${name}.jpg`);
  }
  // Panier rempli
  await page.goto(base + "/medailles/coeur-rond", { waitUntil: "networkidle" });
  await page.getByLabel("Prénom de votre animal").fill("JANE");
  await page.getByRole("button", { name: /Ajouter au panier/ }).click();
  await page.goto(base + "/panier", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot(page, `${out}/${device}-panier.jpg`);

  if (process.env.CAPTURE_ADMIN_EMAIL) {
    await page.goto(base + "/admin/connexion");
    await shot(page, `${out}/${device}-admin-connexion.jpg`, false);
    await page.getByLabel("Adresse email").fill(process.env.CAPTURE_ADMIN_EMAIL);
    await page.getByLabel("Mot de passe").fill(process.env.CAPTURE_ADMIN_PASSWORD ?? "");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL(/\/admin$/);
    for (const [name, path] of [
      ["admin-tableau-de-bord", "/admin"],
      ["admin-produits", "/admin/produits"],
      ["admin-commandes", "/admin/commandes"],
      ["admin-medias", "/admin/medias"],
      ["admin-contenus-accueil", "/admin/contenus/home"],
      ["admin-reglages", "/admin/reglages"],
    ]) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      await shot(page, `${out}/${device}-${name}.jpg`, device === "mobile");
    }
    const first = page.locator("a[href^='/admin/produits/']").filter({ hasText: "Cœur rond" }).first();
    await page.goto(base + "/admin/produits", { waitUntil: "networkidle" });
    await first.click();
    await page.waitForURL(/\/admin\/produits\/[0-9a-f-]{36}/);
    await page.waitForLoadState("networkidle");
    await shot(page, `${out}/${device}-admin-produit.jpg`, device === "mobile");
    const order = page.locator("main ul a[href^='/admin/commandes/']").first();
    await page.goto(base + "/admin/commandes?paiement=paid", { waitUntil: "networkidle" });
    if (await order.count()) {
      await order.click();
      await page.waitForURL(/\/admin\/commandes\/[0-9a-f-]{36}/);
      await page.waitForLoadState("networkidle");
      await shot(page, `${out}/${device}-admin-commande.jpg`, device === "mobile");
    }
    await page.goto(base + "/admin");
    await page.context().clearCookies();
  }
  await context.close();
}
await browser.close();
console.log(`Captures enregistrées dans ${out}`);
