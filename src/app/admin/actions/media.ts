"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth/admin";
import { revalidateSite } from "@/lib/admin/revalidate";
import type { MediaItem } from "@/lib/admin/types";
import { mediaRowToItem } from "@/lib/admin/media";
import { ImageValidationError, processUpload } from "@/lib/media/process";
import type { Database } from "@/lib/supabase/database.types";
import { cleanText, uuidSchema, type ActionResult } from "@/lib/validation/common";

type MediaRow = Database["public"]["Tables"]["media"]["Row"];

function toItem(row: MediaRow): MediaItem {
  return mediaRowToItem(row);
}

export async function uploadMedia(formData: FormData): Promise<ActionResult<MediaItem>> {
  let admin;
  try {
    admin = await assertAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Aucun fichier reçu." };
  const alt = cleanText(String(formData.get("alt") ?? "")).slice(0, 300);
  const originalName = cleanText(String(formData.get("originalName") ?? file.name)).slice(0, 200);

  let processed;
  try {
    processed = await processUpload(file);
  } catch (e) {
    return { ok: false, error: e instanceof ImageValidationError ? e.message : "Image illisible." };
  }

  const now = new Date();
  const path = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${processed.extension}`;
  const upload = await admin.supabase.storage
    .from("media")
    .upload(path, processed.buffer, { contentType: processed.mimeType, cacheControl: "31536000", upsert: false });
  if (upload.error) return { ok: false, error: "Envoi vers le stockage impossible. Réessayez." };

  const { data, error } = await admin.supabase
    .from("media")
    .insert({
      path,
      mime_type: processed.mimeType,
      size_bytes: processed.buffer.length,
      width: processed.width,
      height: processed.height,
      alt,
      original_filename: originalName || null,
      created_by: admin.userId,
    })
    .select("*")
    .single();
  if (error || !data) {
    await admin.supabase.storage.from("media").remove([path]);
    return { ok: false, error: "Enregistrement de la photo impossible." };
  }
  return { ok: true, message: "Photo importée.", data: toItem(data) };
}

export async function listMedia(params: { q?: string; placeholders?: boolean; offset?: number }): Promise<
  ActionResult<{ items: MediaItem[]; hasMore: boolean }>
> {
  try {
    const admin = await assertAdmin();
    const limit = 48;
    const offset = Math.max(0, Math.floor(params.offset ?? 0));
    let query = admin.supabase.from("media").select("*").order("created_at", { ascending: false }).range(offset, offset + limit);
    if (params.placeholders) query = query.eq("is_placeholder", true);
    const q = cleanText(params.q ?? "").slice(0, 80);
    if (q) query = query.or(`alt.ilike.%${q.replace(/[%_,()]/g, " ")}%,original_filename.ilike.%${q.replace(/[%_,()]/g, " ")}%`);
    const { data, error } = await query;
    if (error) return { ok: false, error: "Lecture de la médiathèque impossible." };
    const rows = data ?? [];
    return { ok: true, data: { items: rows.slice(0, limit).map(toItem), hasMore: rows.length > limit } };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

const updateSchema = z.object({
  id: uuidSchema,
  alt: z.string().max(300),
  focalX: z.coerce.number().min(0).max(100),
  focalY: z.coerce.number().min(0).max(100),
});

export async function updateMedia(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const parsed = updateSchema.safeParse({
      id: formData.get("id"),
      alt: cleanText(String(formData.get("alt") ?? "")),
      focalX: formData.get("focalX"),
      focalY: formData.get("focalY"),
    });
    if (!parsed.success) return { ok: false, error: "Valeurs invalides." };
    const { error } = await admin.supabase
      .from("media")
      .update({ alt: parsed.data.alt, focal_x: parsed.data.focalX, focal_y: parsed.data.focalY })
      .eq("id", parsed.data.id);
    if (error) return { ok: false, error: "Modification impossible." };
    revalidateSite();
    return { ok: true, message: "Photo mise à jour." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function mediaUsage(id: string): Promise<{ products: number; product_stories: number; collections: number; settings: string[] } | null> {
  const admin = await assertAdmin();
  const { data } = await admin.supabase.rpc("media_usage", { p_media_id: id });
  return (data as { products: number; product_stories: number; collections: number; settings: string[] }) ?? null;
}

export async function deleteMedia(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const id = uuidSchema.safeParse(formData.get("id"));
    if (!id.success) return { ok: false, error: "Photo introuvable." };
    const usage = await mediaUsage(id.data);
    if (!usage) return { ok: false, error: "Vérification impossible." };
    const total = usage.products + usage.product_stories + usage.collections + usage.settings.length;
    if (total > 0) {
      return {
        ok: false,
        error: `Cette photo est encore utilisée (${[
          usage.products ? `${usage.products} produit(s)` : "",
          usage.product_stories ? `${usage.product_stories} bandeau(x) produit` : "",
          usage.collections ? `${usage.collections} collection(s)` : "",
          usage.settings.length ? `contenus : ${usage.settings.join(", ")}` : "",
        ]
          .filter(Boolean)
          .join(", ")}). Remplacez-la d’abord.`,
      };
    }
    const { data: row } = await admin.supabase.from("media").select("path, bucket").eq("id", id.data).maybeSingle();
    if (!row) return { ok: false, error: "Photo introuvable." };
    const { error } = await admin.supabase.from("media").delete().eq("id", id.data);
    if (error) return { ok: false, error: "Suppression impossible (photo utilisée ?)." };
    await admin.supabase.storage.from(row.bucket).remove([row.path]);
    return { ok: true, message: "Photo supprimée." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
