import { previewStatus } from "./mode";

/**
 * Informations de diagnostic NON sensibles sur le déploiement : aucune clé,
 * seulement l'état des variables (présente / absente) et le contexte Vercel.
 */
export function deploymentDiagnostic() {
  const preview = previewStatus();
  const vercelEnv = process.env.VERCEL_ENV ?? null; // production | preview | development
  return {
    previewMode: preview.active,
    previewSource: preview.source,
    previewVariable: preview.runtime,
    previewValue: preview.runtime === "non reconnue" ? preview.rawValue : null,
    supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()),
    vercel: process.env.VERCEL === "1",
    vercelEnvironment: vercelEnv,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  };
}

export const VERCEL_ENV_LABELS: Record<string, string> = {
  production: "Production",
  preview: "Preview",
  development: "Development",
};
