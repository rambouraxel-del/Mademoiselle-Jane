import { expect, test } from "@playwright/test";
import { deleteUser } from "../support/db";
import { loginAdmin, resetRateLimits, service } from "./helpers";

/** Récupération du mot de passe avec le vrai email reçu (Mailpit local). */
test("mot de passe oublié : email, nouveau mot de passe, connexion", async ({ page }) => {
  await resetRateLimits();
  const db = service();
  const email = `reset-${Date.now()}@example.test`;
  const { data } = await db.auth.admin.createUser({ email, password: `Ancien-${Date.now()}-Mdp!`, email_confirm: true });
  await db.from("admins").insert({ user_id: data.user!.id, display_name: "Axel" });

  await page.goto("/admin/mot-de-passe-oublie");
  await page.getByLabel("Adresse email du compte").fill(email);
  await page.getByRole("button", { name: "Recevoir le lien de réinitialisation" }).click();
  await expect(page.getByText(/un email de réinitialisation vient d’être envoyé/)).toBeVisible();

  let link = "";
  for (let i = 0; i < 20 && !link; i++) {
    const res = await fetch(`http://127.0.0.1:54324/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`);
    const json = (await res.json()) as { messages: { ID: string }[] };
    if (json.messages?.length) {
      const msg = await (await fetch(`http://127.0.0.1:54324/api/v1/message/${json.messages[0].ID}`)).json();
      link = (msg.HTML as string).match(/href="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&") ?? "";
    }
    if (!link) await page.waitForTimeout(500);
  }
  expect(link).toContain("/auth/v1/verify");
  await page.goto(link);
  await expect(page).toHaveURL(/\/admin\/nouveau-mot-de-passe/);
  const newPassword = `Nouveau-${Date.now()}-Mdp!`;
  await page.getByLabel(/Nouveau mot de passe/).fill(newPassword);
  await page.getByLabel("Confirmer le mot de passe").fill(newPassword);
  await page.getByRole("button", { name: "Enregistrer le mot de passe" }).click();
  await expect(page.getByText("Votre mot de passe a été modifié.")).toBeVisible();

  await page.context().clearCookies();
  await loginAdmin(page, email, newPassword);
  await expect(page.getByRole("heading", { name: /Bonjour Axel/ })).toBeVisible();
  await deleteUser(data.user!.id);
});

/** Lien « token_hash » (modèle d'email conseillé en production) : fonctionne sur un autre appareil. */
test("lien de réinitialisation avec jeton (autre appareil)", async ({ page }) => {
  const db = service();
  const email = `reset2-${Date.now()}@example.test`;
  const { data } = await db.auth.admin.createUser({ email, password: `Ancien-${Date.now()}-Mdp!`, email_confirm: true });
  await db.from("admins").insert({ user_id: data.user!.id, display_name: "Ophélie" });
  const { data: link, error } = await db.auth.admin.generateLink({ type: "recovery", email });
  expect(error).toBeNull();
  await page.goto(`/admin/auth/confirm?token_hash=${link.properties!.hashed_token}&type=recovery&next=/admin/nouveau-mot-de-passe`);
  await expect(page).toHaveURL(/\/admin\/nouveau-mot-de-passe/);
  // Un lien déjà utilisé ou falsifié est refusé
  await page.context().clearCookies();
  await page.goto(`/admin/auth/confirm?token_hash=${link.properties!.hashed_token}&type=recovery&next=/admin/nouveau-mot-de-passe`);
  await expect(page).toHaveURL(/lien=expire/);
  await deleteUser(data.user!.id);
});
