/**
 * Détection du mode aperçu visuel, utilisable partout (pages, proxy, robots).
 *
 * Variable : PREVIEW_MODE=true (alias accepté : NEXT_PUBLIC_PREVIEW_MODE).
 * Valeurs acceptées, sans tenir compte des majuscules, espaces ou guillemets :
 * true, 1, yes, oui, on.
 *
 * La valeur est lue à l'exécution ET mémorisée au moment du build
 * (MJ_PREVIEW_MODE_BUILD, injectée par next.config.ts) : l'aperçu reste actif
 * même si l'hébergeur ne transmet la variable qu'à l'une des deux étapes.
 */

const TRUE_VALUES = new Set(["true", "1", "yes", "oui", "on"]);

export function parsePreviewFlag(raw: string | undefined | null): boolean {
  if (raw === undefined || raw === null) return false;
  const cleaned = raw.trim().replace(/^["']|["']$/g, "").trim().toLowerCase();
  return TRUE_VALUES.has(cleaned);
}

export type PreviewStatus = {
  active: boolean;
  /** D'où vient l'activation (pour le diagnostic). */
  source: "PREVIEW_MODE" | "NEXT_PUBLIC_PREVIEW_MODE" | "build" | null;
  /** État de la variable à l'exécution, sans jamais exposer d'autre valeur. */
  runtime: "absente" | "vide" | "reconnue" | "non reconnue";
  rawValue: string | null;
};

export function previewStatus(): PreviewStatus {
  const runtime = process.env.PREVIEW_MODE;
  const alias = process.env.NEXT_PUBLIC_PREVIEW_MODE;
  const build = process.env.MJ_PREVIEW_MODE_BUILD;

  const runtimeState: PreviewStatus["runtime"] =
    runtime === undefined ? "absente" : runtime.trim() === "" ? "vide" : parsePreviewFlag(runtime) ? "reconnue" : "non reconnue";
  const rawValue = runtime === undefined ? null : runtime.slice(0, 20);

  if (parsePreviewFlag(runtime)) return { active: true, source: "PREVIEW_MODE", runtime: runtimeState, rawValue };
  if (parsePreviewFlag(alias)) return { active: true, source: "NEXT_PUBLIC_PREVIEW_MODE", runtime: runtimeState, rawValue };
  if (parsePreviewFlag(build)) return { active: true, source: "build", runtime: runtimeState, rawValue };
  return { active: false, source: null, runtime: runtimeState, rawValue };
}

export function isPreviewActive(): boolean {
  return previewStatus().active;
}
