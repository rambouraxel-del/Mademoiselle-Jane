"use server";

import { z } from "zod";
import { assertAdmin } from "@/lib/auth/admin";
import { revalidateSite } from "@/lib/admin/revalidate";
import { parsePriceToCents } from "@/lib/format";
import { cleanText, uuidSchema, type ActionResult } from "@/lib/validation/common";

const zoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().transform((v) => cleanText(v)).pipe(z.string().min(1, { error: "Nom de zone obligatoire." }).max(80)),
  countries: z
    .string()
    .transform((v) => [...new Set(v.toUpperCase().split(/[\s,;]+/).filter(Boolean))])
    .pipe(z.array(z.string().regex(/^[A-Z]{2}$/, { error: "Codes pays sur 2 lettres (ex. FR, BE)." })).min(1, { error: "Indiquez au moins un pays." }).max(60)),
  price: z.string(),
  freeFrom: z.string(),
  delayText: z.string().transform((v) => cleanText(v)).pipe(z.string().max(120)),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(1000),
});

export async function saveShippingZone(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const parsed = zoneSchema.safeParse({
      id: formData.get("id")?.toString() || undefined,
      name: formData.get("name") ?? "",
      countries: formData.get("countries") ?? "",
      price: formData.get("price") ?? "",
      freeFrom: formData.get("freeFrom") ?? "",
      delayText: formData.get("delayText") ?? "",
      isActive: formData.get("isActive") === "on",
      sortOrder: formData.get("sortOrder") || 0,
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
    const d = parsed.data;
    const price = parsePriceToCents(d.price);
    if (price === null) return { ok: false, error: "Frais de livraison invalides (ex. 4,90 ; 0 pour offerts)." };
    const freeFrom = d.freeFrom.trim() === "" ? null : parsePriceToCents(d.freeFrom);
    if (d.freeFrom.trim() !== "" && freeFrom === null) return { ok: false, error: "Seuil de gratuité invalide." };
    const values = {
      name: d.name,
      countries: d.countries,
      price_cents: price,
      free_from_cents: freeFrom,
      delay_text: d.delayText,
      is_active: d.isActive,
      sort_order: d.sortOrder,
    };
    if (d.id) {
      if (!uuidSchema.safeParse(d.id).success) return { ok: false, error: "Zone introuvable." };
      const { error } = await admin.supabase.from("shipping_zones").update(values).eq("id", d.id);
      if (error) return { ok: false, error: "Enregistrement impossible." };
    } else {
      const { error } = await admin.supabase.from("shipping_zones").insert(values);
      if (error) return { ok: false, error: "Création impossible." };
    }
    revalidateSite();
    return { ok: true, message: "Zone de livraison enregistrée." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteShippingZone(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const id = uuidSchema.safeParse(formData.get("id"));
    if (!id.success) return { ok: false, error: "Zone introuvable." };
    const { error } = await admin.supabase.from("shipping_zones").delete().eq("id", id.data);
    if (error) return { ok: false, error: "Suppression impossible." };
    revalidateSite();
    return { ok: true, message: "Zone supprimée." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function setMessageStatus(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const id = uuidSchema.safeParse(formData.get("id"));
    const status = z.enum(["new", "read", "archived"]).safeParse(formData.get("status"));
    if (!id.success || !status.success) return { ok: false, error: "Message introuvable." };
    const { error } = await admin.supabase.from("contact_messages").update({ status: status.data }).eq("id", id.data);
    if (error) return { ok: false, error: "Modification impossible." };
    return { ok: true, message: status.data === "archived" ? "Message archivé." : status.data === "read" ? "Marqué comme lu." : "Marqué comme non lu." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteMessage(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const id = uuidSchema.safeParse(formData.get("id"));
    if (!id.success) return { ok: false, error: "Message introuvable." };
    const { error } = await admin.supabase.from("contact_messages").delete().eq("id", id.data);
    if (error) return { ok: false, error: "Suppression impossible." };
    return { ok: true, message: "Message supprimé." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteSubscriber(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const id = uuidSchema.safeParse(formData.get("id"));
    if (!id.success) return { ok: false, error: "Abonné introuvable." };
    const { error } = await admin.supabase.from("newsletter_subscribers").delete().eq("id", id.data);
    if (error) return { ok: false, error: "Suppression impossible." };
    return { ok: true, message: "Adresse supprimée de la liste." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
