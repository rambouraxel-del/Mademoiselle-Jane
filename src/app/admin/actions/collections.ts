"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth/admin";
import { revalidateSite } from "@/lib/admin/revalidate";
import { slugify } from "@/lib/format";
import { cleanText, uuidSchema, zodFieldErrors, type ActionResult } from "@/lib/validation/common";

const schema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().min(1, { error: "Le nom est obligatoire." }).max(120)),
  slug: z.string().transform((v) => slugify(v)),
  description: z
    .string()
    .transform((v) => cleanText(v, true))
    .pipe(z.string().max(2000)),
  imageId: z.string(),
  isPublished: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(100000),
  seoTitle: z.string().transform((v) => cleanText(v)).pipe(z.string().max(70)),
  seoDescription: z.string().transform((v) => cleanText(v)).pipe(z.string().max(170)),
});

export async function saveCollection(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  let createdId: string | null = null;
  try {
    const admin = await assertAdmin();
    const parsed = schema.safeParse({
      id: formData.get("id")?.toString() || undefined,
      name: formData.get("name") ?? "",
      slug: formData.get("slug")?.toString() || formData.get("name")?.toString() || "",
      description: formData.get("description") ?? "",
      imageId: formData.get("imageId") ?? "",
      isPublished: formData.get("isPublished") === "on",
      sortOrder: formData.get("sortOrder") || 0,
      seoTitle: formData.get("seoTitle") ?? "",
      seoDescription: formData.get("seoDescription") ?? "",
    });
    if (!parsed.success) return { ok: false, error: "Merci de corriger le formulaire.", fieldErrors: zodFieldErrors(parsed.error) };
    const d = parsed.data;
    if (!d.slug) return { ok: false, error: "Adresse (URL) invalide." };
    const imageId = uuidSchema.safeParse(d.imageId).success ? d.imageId : null;
    const values = {
      name: d.name,
      slug: d.slug,
      description: d.description,
      image_id: imageId,
      is_published: d.isPublished,
      sort_order: d.sortOrder,
      seo_title: d.seoTitle,
      seo_description: d.seoDescription,
    };
    if (d.id) {
      if (!uuidSchema.safeParse(d.id).success) return { ok: false, error: "Collection introuvable." };
      const { error } = await admin.supabase.from("collections").update(values).eq("id", d.id);
      if (error) return { ok: false, error: error.message.includes("slug") ? "Cette adresse est déjà utilisée." : "Enregistrement impossible." };
    } else {
      const { data, error } = await admin.supabase.from("collections").insert(values).select("id").single();
      if (error || !data) return { ok: false, error: error?.message.includes("slug") ? "Cette adresse est déjà utilisée." : "Création impossible." };
      createdId = data.id;
    }
    revalidateSite();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  if (createdId) redirect(`/admin/collections/${createdId}?ok=1`);
  return { ok: true, message: "Collection enregistrée." };
}

export async function deleteCollection(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const id = uuidSchema.safeParse(formData.get("id"));
    if (!id.success) return { ok: false, error: "Collection introuvable." };
    const { error } = await admin.supabase.from("collections").delete().eq("id", id.data);
    if (error) return { ok: false, error: "Suppression impossible." };
    revalidateSite();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  redirect("/admin/collections?supprimee=1");
}

export async function reorderCollectionProducts(collectionId: string, productIds: string[]): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    if (!uuidSchema.safeParse(collectionId).success || !z.array(z.uuid()).max(200).safeParse(productIds).success) {
      return { ok: false, error: "Ordre invalide." };
    }
    for (const [i, productId] of productIds.entries()) {
      const { error } = await admin.supabase
        .from("product_collections")
        .update({ sort_order: i + 1 })
        .eq("collection_id", collectionId)
        .eq("product_id", productId);
      if (error) return { ok: false, error: "Réorganisation impossible." };
    }
    revalidateSite();
    return { ok: true, message: "Ordre enregistré." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function setCollectionMembership(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const collectionId = uuidSchema.safeParse(formData.get("collectionId"));
    const productId = uuidSchema.safeParse(formData.get("productId"));
    const mode = formData.get("mode");
    if (!collectionId.success || !productId.success) return { ok: false, error: "Choisissez un produit." };
    if (mode === "remove") {
      const { error } = await admin.supabase
        .from("product_collections")
        .delete()
        .eq("collection_id", collectionId.data)
        .eq("product_id", productId.data);
      if (error) return { ok: false, error: "Retrait impossible." };
    } else {
      const { data: last } = await admin.supabase
        .from("product_collections")
        .select("sort_order")
        .eq("collection_id", collectionId.data)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { error } = await admin.supabase
        .from("product_collections")
        .upsert({ collection_id: collectionId.data, product_id: productId.data, sort_order: (last?.sort_order ?? 0) + 1 });
      if (error) return { ok: false, error: "Ajout impossible." };
    }
    revalidateSite();
    return { ok: true, message: mode === "remove" ? "Produit retiré de la collection." : "Produit ajouté à la collection." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
