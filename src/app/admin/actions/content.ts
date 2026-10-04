"use server";

import { z } from "zod";
import { assertAdmin } from "@/lib/auth/admin";
import { revalidateSite } from "@/lib/admin/revalidate";
import { DEFAULTS, ICONS, sectionByKey } from "@/lib/content/sections";
import { cleanText, uuidSchema, type ActionResult } from "@/lib/validation/common";

export async function saveSection(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const key = String(formData.get("sectionKey") ?? "");
    const section = sectionByKey(key);
    if (!section) return { ok: false, error: "Section inconnue." };
    const defaults = DEFAULTS[section.key] as Record<string, string | boolean>;
    const value: Record<string, string | boolean> = { ...defaults };
    const errors: Record<string, string> = {};

    for (const field of section.groups.flatMap((g) => g.fields)) {
      const raw = formData.get(field.key);
      switch (field.type) {
        case "boolean":
          value[field.key] = raw === "on";
          break;
        case "image": {
          const v = String(raw ?? "");
          value[field.key] = uuidSchema.safeParse(v).success ? v : "";
          break;
        }
        case "icon": {
          const v = String(raw ?? "");
          value[field.key] = (ICONS as readonly string[]).includes(v) ? v : String(defaults[field.key] ?? "heart");
          break;
        }
        case "email": {
          const v = cleanText(String(raw ?? "")).toLowerCase();
          if (v && !z.email().safeParse(v).success) errors[field.key] = `${field.label} : adresse invalide.`;
          value[field.key] = v;
          break;
        }
        case "url": {
          const v = cleanText(String(raw ?? ""));
          if (v && !/^https:\/\/[^\s<>"]+$/i.test(v)) errors[field.key] = `${field.label} : l’adresse doit commencer par https://`;
          value[field.key] = v;
          break;
        }
        case "link": {
          const v = cleanText(String(raw ?? ""));
          if (v && !(/^\/(?!\/)[^\s<>"]*$/.test(v) || /^https:\/\/[^\s<>"]+$/i.test(v))) {
            errors[field.key] = `${field.label} : indiquez une adresse du site (ex. /medailles) ou https://…`;
          }
          value[field.key] = v;
          break;
        }
        default: {
          const v = cleanText(String(raw ?? ""), field.type === "textarea");
          const max = field.max ?? 2000;
          if ([...v].length > max) errors[field.key] = `${field.label} : ${max} caractères maximum.`;
          value[field.key] = v;
        }
      }
    }
    if (Object.keys(errors).length) return { ok: false, error: "Merci de corriger les champs indiqués.", fieldErrors: errors };

    const { error } = await admin.supabase
      .from("site_settings")
      .upsert({ key: section.key, value, is_public: section.isPublic, updated_by: admin.userId });
    if (error) return { ok: false, error: "Enregistrement impossible." };
    revalidateSite();
    return { ok: true, message: "Contenus enregistrés et publiés sur le site." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().transform((v) => cleanText(v)).pipe(z.string().min(1, { error: "Question obligatoire." }).max(300)),
  answer: z.string().transform((v) => cleanText(v, true)).pipe(z.string().min(1, { error: "Réponse obligatoire." }).max(4000)),
  isPublished: z.boolean(),
});

export async function saveFaq(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const parsed = faqSchema.safeParse({
      id: formData.get("id")?.toString() || undefined,
      question: formData.get("question") ?? "",
      answer: formData.get("answer") ?? "",
      isPublished: formData.get("isPublished") === "on",
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
    const d = parsed.data;
    if (d.id) {
      if (!uuidSchema.safeParse(d.id).success) return { ok: false, error: "Question introuvable." };
      const { error } = await admin.supabase
        .from("faq_items")
        .update({ question: d.question, answer: d.answer, is_published: d.isPublished })
        .eq("id", d.id);
      if (error) return { ok: false, error: "Enregistrement impossible." };
    } else {
      const { data: last } = await admin.supabase.from("faq_items").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
      const { error } = await admin.supabase
        .from("faq_items")
        .insert({ question: d.question, answer: d.answer, is_published: d.isPublished, sort_order: (last?.sort_order ?? 0) + 1 });
      if (error) return { ok: false, error: "Ajout impossible." };
    }
    revalidateSite();
    return { ok: true, message: d.id ? "Question mise à jour." : "Question ajoutée." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteFaq(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const id = uuidSchema.safeParse(formData.get("id"));
    if (!id.success) return { ok: false, error: "Question introuvable." };
    const { error } = await admin.supabase.from("faq_items").delete().eq("id", id.data);
    if (error) return { ok: false, error: "Suppression impossible." };
    revalidateSite();
    return { ok: true, message: "Question supprimée." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function reorderFaq(ids: string[]): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    if (!z.array(z.uuid()).max(200).safeParse(ids).success) return { ok: false, error: "Ordre invalide." };
    for (const [i, id] of ids.entries()) {
      const { error } = await admin.supabase.from("faq_items").update({ sort_order: i + 1 }).eq("id", id);
      if (error) return { ok: false, error: "Réorganisation impossible." };
    }
    revalidateSite();
    return { ok: true, message: "Ordre enregistré." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

const pageSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().transform((v) => cleanText(v)).pipe(z.string().min(1, { error: "Titre obligatoire." }).max(160)),
  body: z.string().transform((v) => cleanText(v, true)).pipe(z.string().max(60000, { error: "Texte trop long." })),
  isComplete: z.boolean(),
  seoDescription: z.string().transform((v) => cleanText(v)).pipe(z.string().max(170)),
});

export async function savePage(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const parsed = pageSchema.safeParse({
      slug: formData.get("slug") ?? "",
      title: formData.get("title") ?? "",
      body: formData.get("body") ?? "",
      isComplete: formData.get("isComplete") === "on",
      seoDescription: formData.get("seoDescription") ?? "",
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
    const d = parsed.data;
    const { error } = await admin.supabase
      .from("pages")
      .update({ title: d.title, body: d.body, is_complete: d.isComplete, seo_description: d.seoDescription })
      .eq("slug", d.slug);
    if (error) return { ok: false, error: "Enregistrement impossible." };
    revalidateSite();
    return { ok: true, message: "Page enregistrée et publiée." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
