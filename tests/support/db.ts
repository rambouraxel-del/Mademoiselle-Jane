import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const opts = { auth: { persistSession: false, autoRefreshToken: false } };

export function service(): Client {
  return createClient<Database>(url(), process.env.SUPABASE_SECRET_KEY!, opts);
}

export function anon(): Client {
  return createClient<Database>(url(), process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, opts);
}

/** Crée un utilisateur (admin ou non) et renvoie un client connecté avec son compte. */
export async function signedInUser(isAdmin: boolean): Promise<{ client: Client; userId: string; email: string }> {
  const svc = service();
  const email = `test-${isAdmin ? "admin" : "user"}-${randomUUID().slice(0, 8)}@example.test`;
  const password = `Pw-${randomUUID()}`;
  const { data, error } = await svc.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw error ?? new Error("createUser");
  if (isAdmin) {
    const { error: e } = await svc.from("admins").insert({ user_id: data.user.id, display_name: "Test" });
    if (e) throw e;
  }
  const client = anon();
  const { error: signError } = await client.auth.signInWithPassword({ email, password });
  if (signError) throw signError;
  return { client, userId: data.user.id, email };
}

export async function deleteUser(userId: string) {
  await service().auth.admin.deleteUser(userId);
}

export async function anyMediaIds(count = 2): Promise<string[]> {
  const { data } = await service().from("media").select("id").order("created_at").limit(count);
  if (!data || data.length < count) throw new Error("Lancez « npm run seed » avant les tests.");
  return data.map((m) => m.id);
}

/** Charge utile minimale pour admin_save_product. */
export function productPayload(over: Record<string, unknown> = {}) {
  const slug = `test-${randomUUID().slice(0, 8)}`;
  return {
    id: "",
    status: "draft",
    slug,
    name: `Médaille test ${slug}`,
    short_description: "Test",
    description: "",
    base_price_cents: 1500,
    shape: "Ronde",
    size_label: "2,5 cm",
    material: "Résine",
    dimensions: "",
    care_info: "",
    personalization_info: "",
    fabrication_delay: "",
    stock_mode: "made_to_order",
    is_available: true,
    sort_order: 50,
    is_featured: false,
    featured_order: 0,
    name_enabled: true,
    name_required: true,
    name_max_length: 12,
    phone_enabled: true,
    phone_required: false,
    phone_max_length: 20,
    story_title: "",
    story_text: "",
    story_image_id: "",
    seo_title: "",
    seo_description: "",
    variants: [{ id: "", ref: "v1", name: "Dorée", finish: "doree", swatch: "", price_cents: "", stock_quantity: "", sku: "", is_active: true, sort_order: 1 }],
    images: [] as { media_id: string; variant_ref: string; alt_override: string }[],
    collections: [] as string[],
    ...over,
  };
}

export async function cleanupProduct(id: string | null | undefined) {
  if (id) await service().from("products").delete().eq("id", id);
}
