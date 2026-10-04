import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import type { Database } from "./database.types";

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

function publicConfig() {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new ConfigurationError(
      "Supabase n'est pas configuré (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
  }
  return { url: env.supabaseUrl, key: env.supabasePublishableKey };
}

/**
 * Client « visiteur » sans session : lecture publique, soumise aux règles RLS.
 * Utilisé pour toutes les pages publiques.
 */
export function createPublicClient() {
  const { url, key } = publicConfig();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

/**
 * Client lié à la session de l'utilisateur connecté (cookies).
 * Utilisé dans l'administration : les règles RLS s'appliquent avec ses droits.
 */
export async function createSessionClient() {
  const { url, key } = publicConfig();
  const cookieStore = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appel depuis un Server Component : le proxy rafraîchit la session.
        }
      },
    },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

/**
 * Client privilégié (clé secrète). Contourne RLS : à réserver aux opérations
 * serveur contrôlées (création de commande, webhooks, formulaires publics).
 * Ne jamais l'utiliser pour une action déclenchée par l'administration sans
 * vérification préalable du rôle administrateur.
 */
export function createServiceClient() {
  if (!env.supabaseUrl || !env.supabaseSecretKey) {
    throw new ConfigurationError("SUPABASE_SECRET_KEY manquant : opération serveur impossible.");
  }
  return createClient<Database>(env.supabaseUrl, env.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}
