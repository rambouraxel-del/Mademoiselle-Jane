/**
 * Point d'entrée préparatoire pour Supabase (base de données,
 * authentification, stockage des photos produit).
 *
 * Non branché dans cette v1 — aucune donnée sensible n'est utilisée.
 * Prochain lot :
 *   1. `npm install @supabase/supabase-js @supabase/ssr`
 *   2. Renseigner NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 *      dans .env.local (voir .env.example).
 *   3. Remplacer ce stub par de vrais clients `createBrowserClient` /
 *      `createServerClient`, et brancher src/services/products.ts et
 *      src/context/CartContext.tsx (persistance côté serveur) dessus.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function getSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase n'est pas encore configuré. Renseignez NEXT_PUBLIC_SUPABASE_URL et " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY, puis installez @supabase/supabase-js."
    );
  }
  return { url: SUPABASE_URL!, anonKey: SUPABASE_ANON_KEY! };
}
