import { expect, test } from "@playwright/test";
import { resetRateLimits, service } from "./helpers";

async function lastLink(email: string, pattern: RegExp): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`http://127.0.0.1:54324/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`);
    const json = (await res.json()) as { messages: { ID: string }[] };
    if (json.messages?.length) {
      const msg = await (await fetch(`http://127.0.0.1:54324/api/v1/message/${json.messages[0].ID}`)).json();
      const found = [...(msg.HTML as string).matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&")).find((h) => pattern.test(h));
      if (found) return found;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Email introuvable");
}

test("newsletter : consentement obligatoire, double confirmation, désinscription", async ({ page }) => {
  test.skip(process.env.EMAIL_PROVIDER !== "smtp", "Emails locaux (Mailpit) non configurés");
  await resetRateLimits();
  const email = `news-${Date.now()}@example.test`;
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await footer.getByLabel("Votre adresse e-mail").fill(email);
  await footer.getByRole("button", { name: "S’inscrire" }).click();
  // Sans case cochée : le navigateur bloque l'envoi (champ obligatoire)
  const { data: none } = await service().from("newsletter_subscribers").select("id").eq("email", email);
  expect(none).toEqual([]);

  await footer.getByRole("checkbox").check();
  await footer.getByRole("button", { name: "S’inscrire" }).click();
  await expect(footer.getByText(/email de confirmation vous a été envoyé/)).toBeVisible();
  let { data } = await service().from("newsletter_subscribers").select("status, consent_text").eq("email", email).single();
  expect(data!.status).toBe("pending");
  expect(data!.consent_text).toMatch(/J’accepte/);

  const confirm = await lastLink(email, /newsletter\/confirmer/);
  await page.goto(confirm.replace(/^https?:\/\/[^/]+/, ""));
  await page.getByRole("button", { name: "Je confirme mon inscription" }).click();
  await expect(page.getByText("Votre inscription est confirmée. Merci !")).toBeVisible();
  ({ data } = await service().from("newsletter_subscribers").select("status, consent_text").eq("email", email).single());
  expect(data!.status).toBe("confirmed");

  const unsubscribe = await lastLink(email, /newsletter\/desinscription/);
  await page.goto(unsubscribe.replace(/^https?:\/\/[^/]+/, ""));
  await page.getByRole("button", { name: "Me désinscrire" }).click();
  await expect(page.getByText(/Vous êtes désinscrit/)).toBeVisible();
  ({ data } = await service().from("newsletter_subscribers").select("status, consent_text").eq("email", email).single());
  expect(data!.status).toBe("unsubscribed");
  await service().from("newsletter_subscribers").delete().eq("email", email);
});
