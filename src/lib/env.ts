import "server-only";

/**
 * Lecture centralisée des variables d'environnement côté serveur.
 * Aucune valeur secrète n'est exposée au navigateur : seules les variables
 * préfixées NEXT_PUBLIC_ le sont, et elles ne contiennent rien de sensible.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

export const env = {
  siteUrl: (read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: read("NEXT_PUBLIC_SUPABASE_URL"),
  supabasePublishableKey: read("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  supabaseSecretKey: read("SUPABASE_SECRET_KEY"),
  stripeSecretKey: read("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: read("STRIPE_WEBHOOK_SECRET"),
  /** Uniquement pour les tests automatisés (serveur stripe-mock). */
  stripeMockUrl: read("STRIPE_MOCK_URL"),
  emailProvider: (read("EMAIL_PROVIDER") ?? "none") as "resend" | "smtp" | "none",
  resendApiKey: read("RESEND_API_KEY"),
  smtpHost: read("SMTP_HOST"),
  smtpPort: Number(read("SMTP_PORT") ?? "587"),
  smtpUser: read("SMTP_USER"),
  smtpPassword: read("SMTP_PASSWORD"),
  smtpSecure: read("SMTP_SECURE") === "true",
  emailFrom: read("EMAIL_FROM"),
  shopNotificationEmail: read("SHOP_NOTIFICATION_EMAIL"),
  formSecret: read("FORM_SECRET"),
  turnstileSiteKey: read("NEXT_PUBLIC_TURNSTILE_SITE_KEY"),
  turnstileSecretKey: read("TURNSTILE_SECRET_KEY"),
};

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabasePublishableKey);
}

export function isStripeConfigured(): boolean {
  return Boolean(env.stripeSecretKey && env.stripeWebhookSecret);
}

/** Paiement en mode test Stripe (clé sk_test_…) ou non configuré. */
export function paymentMode(): "live" | "test" | "disabled" {
  if (!env.stripeSecretKey) return "disabled";
  return env.stripeSecretKey.startsWith("sk_live_") ? "live" : "test";
}

export function isEmailConfigured(): boolean {
  if (!env.emailFrom) return false;
  if (env.emailProvider === "resend") return Boolean(env.resendApiKey);
  if (env.emailProvider === "smtp") return Boolean(env.smtpHost);
  return false;
}

export function requireFormSecret(): string {
  if (env.formSecret && env.formSecret.length >= 32) return env.formSecret;
  if (process.env.NODE_ENV !== "production") {
    // En développement uniquement : secret local non sensible.
    return "dev-only-form-secret-change-me-in-production-0000";
  }
  throw new Error("FORM_SECRET manquant ou trop court (32 caractères minimum).");
}
