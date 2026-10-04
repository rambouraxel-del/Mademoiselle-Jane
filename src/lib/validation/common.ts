import { z } from "zod";

/** Supprime les caractères de contrôle (hors retours à la ligne) et normalise les espaces. */
export function cleanText(value: string, multiline = false): string {
  const stripped = value.replace(multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, "");
  return multiline ? stripped.replace(/\r\n/g, "\n").trim() : stripped.replace(/\s+/g, " ").trim();
}

export const emailSchema = z
  .string()
  .transform((v) => cleanText(v).toLowerCase())
  .pipe(z.email({ error: "Adresse email invalide." }).max(254, { error: "Adresse email trop longue." }));

export const uuidSchema = z.uuid({ error: "Identifiant invalide." });

/** Prénom gravé : lettres (accents compris), espaces, tirets, apostrophes. */
export const ENGRAVING_NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' \-.&]*$/u;
/** Téléphone : chiffres, espaces, +, points, tirets, parenthèses. */
export const PHONE_PATTERN = /^\+?[0-9][0-9 .\-()]{4,}$/;

export type ActionResult<T = unknown> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
