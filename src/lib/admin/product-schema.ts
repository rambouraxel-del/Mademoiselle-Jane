import { z } from "zod";
import { parsePriceToCents } from "@/lib/format";
import { cleanText } from "@/lib/validation/common";

const text = (max: number, label: string) =>
  z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().max(max, { error: `${label} : ${max} caractères maximum.` }));
const longText = (max: number, label: string) =>
  z
    .string()
    .transform((v) => cleanText(v, true))
    .pipe(z.string().max(max, { error: `${label} : ${max} caractères maximum.` }));

const price = (label: string, optional = false) =>
  z.string().transform((v, ctx) => {
    const t = v.trim();
    if (t === "" && optional) return null;
    const cents = parsePriceToCents(t);
    if (cents === null || cents < 0 || cents > 1_000_000) {
      ctx.addIssue({ code: "custom", message: `${label} : prix invalide (ex. 18,00).` });
      return z.NEVER;
    }
    return cents;
  });

const optionalInt = (label: string) =>
  z.string().transform((v, ctx) => {
    const t = v.trim();
    if (t === "") return null;
    if (!/^\d{1,6}$/.test(t)) {
      ctx.addIssue({ code: "custom", message: `${label} : nombre entier attendu.` });
      return z.NEVER;
    }
    return Number(t);
  });

export const productFormSchema = z.object({
  id: z.uuid().nullable(),
  intent: z.enum(["save", "publish", "unpublish", "archive"]),
  currentStatus: z.enum(["draft", "published", "archived"]),
  name: text(120, "Nom").pipe(z.string().min(1, { error: "Le nom est obligatoire." })),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: "Adresse (URL) : lettres minuscules, chiffres et tirets uniquement." })
    .max(80),
  shortDescription: text(400, "Description courte"),
  description: longText(8000, "Description détaillée"),
  basePrice: price("Prix de base"),
  shape: text(40, "Forme"),
  sizeLabel: text(40, "Diamètre"),
  material: text(120, "Matière"),
  dimensions: text(200, "Dimensions"),
  careInfo: longText(4000, "Entretien"),
  personalizationInfo: longText(4000, "Personnalisation"),
  fabricationDelay: text(200, "Délai de fabrication"),
  stockMode: z.enum(["made_to_order", "limited"]),
  isAvailable: z.boolean(),
  sortOrder: z.number().int().min(0).max(100000),
  isFeatured: z.boolean(),
  featuredOrder: z.number().int().min(0).max(100000),
  nameEnabled: z.boolean(),
  nameRequired: z.boolean(),
  nameMaxLength: z.number().int().min(1, { error: "Longueur du prénom : 1 minimum." }).max(60, { error: "Longueur du prénom : 60 maximum." }),
  phoneEnabled: z.boolean(),
  phoneRequired: z.boolean(),
  phoneMaxLength: z.number().int().min(6, { error: "Longueur du téléphone : 6 minimum." }).max(30, { error: "Longueur du téléphone : 30 maximum." }),
  storyTitle: text(160, "Titre du bandeau"),
  storyText: longText(1000, "Texte du bandeau"),
  storyImageId: z.uuid().nullable(),
  seoTitle: text(70, "Titre SEO"),
  seoDescription: text(170, "Description SEO"),
  variants: z
    .array(
      z.object({
        id: z.uuid().nullable(),
        ref: z.string().min(1).max(60),
        name: text(60, "Nom de finition").pipe(z.string().min(1, { error: "Chaque finition doit avoir un nom." })),
        finish: z
          .string()
          .trim()
          .toLowerCase()
          .regex(/^[a-z0-9-]*$/, { error: "Clé de finition : lettres minuscules, chiffres, tirets." })
          .max(40),
        swatch: z.string().trim().max(120).regex(/^[#a-z0-9(),.%\s-]*$/i, { error: "Couleur de pastille invalide." }),
        price: price("Prix de la finition", true),
        stock: optionalInt("Stock"),
        sku: text(60, "Référence"),
        isActive: z.boolean(),
      }),
    )
    .max(20),
  images: z
    .array(z.object({ mediaId: z.uuid(), variantRef: z.string().max(60).nullable(), altOverride: text(300, "Texte alternatif") }))
    .max(30),
  collections: z.array(z.uuid()).max(50),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormData = z.output<typeof productFormSchema>;

/** Statut final selon le bouton utilisé. */
export function nextStatus(intent: ProductFormData["intent"], current: ProductFormData["currentStatus"]) {
  if (intent === "publish") return "published" as const;
  if (intent === "unpublish") return "draft" as const;
  if (intent === "archive") return "archived" as const;
  return current;
}

/** Vérifications supplémentaires avant publication. */
export function publicationProblems(data: ProductFormData): string[] {
  const problems: string[] = [];
  if ((data.basePrice ?? 0) <= 0) problems.push("Le prix de base doit être supérieur à 0.");
  if (data.images.length === 0) problems.push("Ajoutez au moins une photo.");
  if (data.variants.length > 0 && !data.variants.some((v) => v.isActive)) problems.push("Activez au moins une finition.");
  if (data.stockMode === "limited" && data.variants.some((v) => v.isActive && v.stock === null)) {
    problems.push("En stock limité, indiquez la quantité de chaque finition active.");
  }
  if (data.nameRequired && !data.nameEnabled) problems.push("Le prénom ne peut pas être obligatoire s’il est désactivé.");
  if (data.phoneRequired && !data.phoneEnabled) problems.push("Le téléphone ne peut pas être obligatoire s’il est désactivé.");
  const finishes = data.variants.map((v) => v.finish).filter(Boolean);
  if (new Set(finishes).size !== finishes.length) problems.push("Deux finitions ont la même clé de filtre.");
  return problems;
}

export function toDbPayload(data: ProductFormData, status: "draft" | "published" | "archived") {
  return {
    id: data.id ?? "",
    status,
    slug: data.slug,
    name: data.name,
    short_description: data.shortDescription,
    description: data.description,
    base_price_cents: data.basePrice ?? 0,
    shape: data.shape,
    size_label: data.sizeLabel,
    material: data.material,
    dimensions: data.dimensions,
    care_info: data.careInfo,
    personalization_info: data.personalizationInfo,
    fabrication_delay: data.fabricationDelay,
    stock_mode: data.stockMode,
    is_available: data.isAvailable,
    sort_order: data.sortOrder,
    is_featured: data.isFeatured,
    featured_order: data.featuredOrder,
    name_enabled: data.nameEnabled,
    name_required: data.nameEnabled && data.nameRequired,
    name_max_length: data.nameMaxLength,
    phone_enabled: data.phoneEnabled,
    phone_required: data.phoneEnabled && data.phoneRequired,
    phone_max_length: data.phoneMaxLength,
    story_title: data.storyTitle,
    story_text: data.storyText,
    story_image_id: data.storyImageId ?? "",
    seo_title: data.seoTitle,
    seo_description: data.seoDescription,
    variants: data.variants.map((v, i) => ({
      id: v.id ?? "",
      ref: v.ref,
      name: v.name,
      finish: v.finish,
      swatch: v.swatch,
      price_cents: v.price === null ? "" : String(v.price),
      stock_quantity: v.stock === null ? "" : String(v.stock),
      sku: v.sku,
      is_active: v.isActive,
      sort_order: i + 1,
    })),
    images: data.images.map((img) => ({ media_id: img.mediaId, variant_ref: img.variantRef ?? "", alt_override: img.altOverride })),
    collections: [...new Set(data.collections)],
  };
}
