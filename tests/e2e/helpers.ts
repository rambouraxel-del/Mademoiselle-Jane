import { expect, type Page } from "@playwright/test";
import { service } from "../support/db";

export { service };

export async function addToCart(page: Page, slug: string, name: string, finition?: string) {
  await page.goto(`/medailles/${slug}${finition ? `?finition=${finition}` : ""}`);
  await page.getByLabel("Prénom de votre animal").fill(name);
  await page.getByRole("button", { name: /Ajouter au panier/ }).click();
  await expect(page.getByText(/Ajouté au panier/)).toBeVisible();
}

export async function loginAdmin(page: Page, email: string, password: string) {
  await page.goto("/admin/connexion");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

export async function noHorizontalOverflow(page: Page) {
  // Sur mobile, le navigateur élargit la fenêtre si un élément déborde :
  // on compare donc à la largeur prévue de l'écran, pas à la fenêtre effective.
  const expected = page.viewportSize()!.width;
  const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
  expect(inner).toBe(expected);
  expect(scroll).toBeLessThanOrEqual(expected);
}

export async function resetRateLimits() {
  await service().from("rate_limits").delete().neq("key", "");
}
