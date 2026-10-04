const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/** 1800 → « 18,00 € » */
export function formatPrice(cents: number): string {
  return euro.format(cents / 100).replace(/ /g, " ");
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });
const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export function formatDate(iso: string | null | undefined): string {
  return iso ? dateFormatter.format(new Date(iso)) : "";
}

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTimeFormatter.format(new Date(iso)) : "";
}

/** Convertit une saisie « 18,50 » ou « 18.5 » en centimes. */
export function parsePriceToCents(input: string): number | null {
  const normalized = input.replace(/\s|€/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

export function centsToInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const COUNTRY_NAMES: Record<string, string> = {
  FR: "France",
  BE: "Belgique",
  CH: "Suisse",
  LU: "Luxembourg",
  MC: "Monaco",
  DE: "Allemagne",
  ES: "Espagne",
  IT: "Italie",
  NL: "Pays-Bas",
  PT: "Portugal",
  AT: "Autriche",
  IE: "Irlande",
  GB: "Royaume-Uni",
  CA: "Canada",
  US: "États-Unis",
};

export function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}
