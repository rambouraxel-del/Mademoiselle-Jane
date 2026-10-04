"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth/admin";
import { nextStatus, productFormSchema, publicationProblems, toDbPayload } from "@/lib/admin/product-schema";
import { revalidateSite } from "@/lib/admin/revalidate";
import { uuidSchema, zodFieldErrors, type ActionResult } from "@/lib/validation/common";

export async function saveProduct(payload: unknown): Promise<ActionResult<{ id: string; status: string }>> {
  let admin;
  try {
    admin = await assertAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  const parsed = productFormSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Merci de corriger les champs indiqués.", fieldErrors: zodFieldErrors(parsed.error) };
  }
  const data = parsed.data;
  const status = nextStatus(data.intent, data.currentStatus);
  if (status === "published") {
    const problems = publicationProblems(data);
    if (problems.length) return { ok: false, error: "Publication impossible :", fieldErrors: Object.fromEntries(problems.map((p, i) => [`p${i}`, p])) };
  }

  const { data: id, error } = await admin.supabase.rpc("admin_save_product", { p: toDbPayload(data, status) });
  if (error || !id) {
    if (error?.message.includes("products_slug_key")) {
      return { ok: false, error: "Cette adresse (URL) est déjà utilisée par un autre produit." };
    }
    if (error?.message.includes("violates foreign key")) {
      return { ok: false, error: "Une photo ou une collection choisie n’existe plus. Rechargez la page." };
    }
    return { ok: false, error: "Enregistrement impossible. Vos modifications n’ont pas été appliquées." };
  }
  revalidateSite();
  const messages = {
    published: data.currentStatus === "published" ? "Modifications publiées sur le site." : "Produit publié : il est visible dans la boutique.",
    draft: data.intent === "unpublish" ? "Produit dépublié : il n’est plus visible sur le site." : "Brouillon enregistré (invisible sur le site).",
    archived: "Produit archivé : il n’est plus visible sur le site.",
  } as const;
  return { ok: true, message: messages[status], data: { id, status } };
}

export async function duplicateProduct(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  let newId: string;
  try {
    const admin = await assertAdmin();
    const id = uuidSchema.safeParse(formData.get("id"));
    if (!id.success) return { ok: false, error: "Produit introuvable." };
    const { data, error } = await admin.supabase.rpc("admin_duplicate_product", { p_id: id.data });
    if (error || !data) return { ok: false, error: "Duplication impossible." };
    newId = data;
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  redirect(`/admin/produits/${newId}?ok=copie`);
}

const reorderSchema = z.object({ ids: z.array(z.uuid()).max(200), field: z.enum(["sort_order", "featured_order"]) });

export async function reorderProducts(ids: string[], field: "sort_order" | "featured_order"): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const parsed = reorderSchema.safeParse({ ids, field });
    if (!parsed.success) return { ok: false, error: "Ordre invalide." };
    for (const [i, id] of parsed.data.ids.entries()) {
      const { error } = await admin.supabase
        .from("products")
        .update(field === "sort_order" ? { sort_order: i + 1 } : { featured_order: i + 1 })
        .eq("id", id);
      if (error) return { ok: false, error: "Réorganisation impossible." };
    }
    revalidateSite();
    return { ok: true, message: "Ordre enregistré." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function setFeatured(id: string, featured: boolean): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    if (!uuidSchema.safeParse(id).success) return { ok: false, error: "Produit introuvable." };
    const { error } = await admin.supabase.from("products").update({ is_featured: featured }).eq("id", id);
    if (error) return { ok: false, error: "Modification impossible." };
    revalidateSite();
    return { ok: true, message: featured ? "Ajouté aux coups de cœur." : "Retiré des coups de cœur." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
