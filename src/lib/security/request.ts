import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { requireFormSecret } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Empreinte de l'adresse IP (HMAC) : permet de limiter les abus sans
 * jamais stocker l'adresse IP en clair.
 */
export async function clientFingerprint(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "unknown";
  return createHmac("sha256", requireFormSecret()).update(`ip:${ip}`).digest("hex").slice(0, 32);
}

export function hashKey(value: string): string {
  return createHmac("sha256", requireFormSecret()).update(value.toLowerCase()).digest("hex").slice(0, 32);
}

/** true = la requête est autorisée. En cas d'indisponibilité, on refuse par prudence. */
export async function rateLimit(bucket: string, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc("rate_limit_hit", {
      p_key: `${bucket}:${key}`,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
}

/**
 * Jeton de formulaire signé contenant l'heure d'affichage : un envoi trop
 * rapide (robot) ou trop ancien est refusé.
 */
export function createFormToken(purpose: string): string {
  const issued = Date.now().toString();
  const sig = createHmac("sha256", requireFormSecret()).update(`${purpose}:${issued}`).digest("hex");
  return `${issued}.${sig}`;
}

export function verifyFormToken(
  purpose: string,
  token: string | null | undefined,
  { minMs = 2500, maxMs = 1000 * 60 * 60 * 6 } = {},
): boolean {
  if (!token) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig || !/^\d+$/.test(issued)) return false;
  const expected = createHmac("sha256", requireFormSecret()).update(`${purpose}:${issued}`).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const age = Date.now() - Number(issued);
  return age >= minMs && age <= maxMs;
}

/** Vérification Cloudflare Turnstile (facultative, activée si les clés sont configurées). */
export async function verifyTurnstile(token: string | null | undefined, secret: string | undefined): Promise<boolean> {
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      cache: "no-store",
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
