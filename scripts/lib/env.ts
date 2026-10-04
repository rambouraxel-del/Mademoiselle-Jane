import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/lib/supabase/database.types";

/**
 * Charge le fichier d'environnement (par défaut .env.local) puis crée un
 * client Supabase avec la clé secrète. Usage : --env=.env.production.local
 */
export function loadEnv(): void {
  const arg = process.argv.find((a) => a.startsWith("--env="));
  const file = arg ? arg.slice("--env=".length) : ".env.local";
  if (existsSync(file)) {
    process.loadEnvFile(file);
  } else if (arg) {
    throw new Error(`Fichier d'environnement introuvable : ${file}`);
  }
}

export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY sont nécessaires.");
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

export function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}
