import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isPreviewMode } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string;
  displayName: string;
  supabase: Awaited<ReturnType<typeof createSessionClient>>;
};

/**
 * Vérifie côté serveur que l'utilisateur connecté est administrateur
 * (présent dans la table `admins`). Le jeton est validé auprès de Supabase.
 */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  // Aperçu visuel : aucune session d'administration n'est acceptée.
  if (isPreviewMode()) return null;
  const supabase = await createSessionClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: admin } = await supabase
    .from("admins")
    .select("display_name")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!admin) return null;
  return { userId: auth.user.id, email: auth.user.email ?? "", displayName: admin.display_name, supabase };
});

/** Pour les pages : redirige vers la connexion si l'accès n'est pas autorisé. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/connexion?refus=1");
  return admin;
}

export class NotAdminError extends Error {
  constructor() {
    super("Accès refusé : réservé aux administrateurs.");
  }
}

/** Pour les actions serveur : lève une erreur si l'accès n'est pas autorisé. */
export async function assertAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) throw new NotAdminError();
  return admin;
}
