"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "@/lib/env";
import { clientFingerprint, hashKey, rateLimit } from "@/lib/security/request";
import { createSessionClient } from "@/lib/supabase/server";
import { emailSchema, type ActionResult } from "@/lib/validation/common";

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Mot de passe requis." }).max(200),
});

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: formData.get("email") ?? "", password: formData.get("password") ?? "" });
  if (!parsed.success) return { ok: false, error: "Email ou mot de passe invalide." };

  const fp = await clientFingerprint();
  const allowed =
    (await rateLimit("login-ip", fp, 20, 900)) && (await rateLimit("login-email", hashKey(parsed.data.email), 8, 900));
  if (!allowed) return { ok: false, error: "Trop de tentatives. Patientez 15 minutes avant de réessayer." };

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { ok: false, error: "Email ou mot de passe incorrect." };

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { ok: false, error: "Ce compte n’a pas accès à l’administration." };
  }
  redirect("/admin");
}

export async function requestPasswordReset(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(formData.get("email") ?? "");
  if (!parsed.success) return { ok: false, error: "Adresse email invalide." };
  const fp = await clientFingerprint();
  if (!(await rateLimit("reset-ip", fp, 5, 3600)) || !(await rateLimit("reset-email", hashKey(parsed.data), 3, 3600))) {
    return { ok: false, error: "Trop de demandes. Merci de réessayer plus tard." };
  }
  const supabase = await createSessionClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${env.siteUrl}/admin/auth/confirm?next=/admin/nouveau-mot-de-passe`,
  });
  // Réponse identique que le compte existe ou non.
  return {
    ok: true,
    message: "Si cette adresse correspond à un compte, un email de réinitialisation vient d’être envoyé.",
  };
}

const passwordSchema = z
  .object({
    password: z.string().min(12, { error: "12 caractères minimum." }).max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { error: "Les deux mots de passe ne correspondent pas.", path: ["confirm"] });

export async function updatePassword(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = passwordSchema.safeParse({ password: formData.get("password") ?? "", confirm: formData.get("confirm") ?? "" });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Mot de passe invalide." };
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, error: "Lien expiré. Refaites une demande de réinitialisation." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: "Le mot de passe n’a pas pu être modifié (trop simple ou identique à l’ancien ?)." };
  redirect("/admin?ok=mot-de-passe");
}

export async function signOut(): Promise<void> {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/connexion");
}
