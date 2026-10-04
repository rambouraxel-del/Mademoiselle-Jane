/**
 * Données initiales de Mademoizelle Jane.
 *
 *   npm run seed                      (utilise .env.local)
 *   npm run seed -- --env=.env.prod   (autre fichier d'environnement)
 *   npm run seed -- --reset-content   (réécrit les textes du site avec ceux des maquettes)
 *
 * Le script est idempotent : il ne crée que ce qui manque. Les produits déjà
 * présents (même slug) ne sont pas modifiés, pour ne jamais écraser le travail
 * fait dans l'administration.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { DEFAULTS, SECTIONS, type SettingsKey } from "../src/lib/content/sections";
import { flag, loadEnv, serviceClient } from "./lib/env";
import {
  SEED_COLLECTION,
  SEED_FAQ,
  SEED_MEDIA,
  SEED_PAGES,
  SEED_PRODUCTS,
  SEED_SHIPPING_ZONES,
} from "./lib/seed-content";

loadEnv();
const supabase = serviceClient();
const MEDIA_DIR = path.join(process.cwd(), "supabase", "seed-media");

function check<T>(label: string, result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(`${label} : ${result.error.message}`);
  return result.data;
}

/** Comme check, mais exige une valeur non nulle. */
function must<T>(label: string, result: { data: T; error: { message: string } | null }): NonNullable<T> {
  const data = check(label, result);
  if (data === null || data === undefined) throw new Error(`${label} : aucune donnée`);
  return data;
}

async function seedMedia(): Promise<Record<string, string>> {
  const ids: Record<string, string> = {};
  for (const [key, def] of Object.entries(SEED_MEDIA)) {
    const storagePath = `seed/${def.file}`;
    const existing = check(
      `média ${key}`,
      await supabase.from("media").select("id").eq("path", storagePath).maybeSingle(),
    );
    if (existing) {
      ids[key] = existing.id;
      continue;
    }
    const buffer = readFileSync(path.join(MEDIA_DIR, def.file));
    const meta = await sharp(buffer).metadata();
    const upload = await supabase.storage
      .from("media")
      .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
    if (upload.error) throw new Error(`Envoi ${def.file} : ${upload.error.message}`);
    const row = must(
      `insertion média ${key}`,
      await supabase
        .from("media")
        .insert({
          path: storagePath,
          mime_type: "image/jpeg",
          size_bytes: buffer.length,
          width: meta.width!,
          height: meta.height!,
          alt: def.alt,
          original_filename: def.file,
          is_placeholder: true,
        })
        .select("id")
        .single(),
    );
    ids[key] = row.id;
    console.log(`  ✓ photo ${def.file}`);
  }
  return ids;
}

async function seedSettings(media: Record<string, string>) {
  const images: Partial<Record<SettingsKey, Record<string, string>>> = {
    home: { hero_image: media["accueil-hero"], story_image: media["accueil-atelier"] },
    story: { hero_image: media["histoire-hero"], section_image: media["histoire-mains"] },
    product_page: { details_image: media["fleur-amour-gros-plan"] },
  };
  const reset = flag("reset-content");
  for (const section of SECTIONS) {
    const value = { ...DEFAULTS[section.key], ...(images[section.key] ?? {}) };
    const existing = check(
      `réglage ${section.key}`,
      await supabase.from("site_settings").select("key").eq("key", section.key).maybeSingle(),
    );
    if (existing && !reset) continue;
    check(
      `écriture ${section.key}`,
      await supabase
        .from("site_settings")
        .upsert({ key: section.key, value, is_public: section.isPublic }),
    );
    console.log(`  ✓ contenus « ${section.title} »`);
  }
}

async function seedPagesAndFaq() {
  for (const page of SEED_PAGES) {
    const existing = check(
      `page ${page.slug}`,
      await supabase.from("pages").select("slug").eq("slug", page.slug).maybeSingle(),
    );
    if (existing) continue;
    check(`page ${page.slug}`, await supabase.from("pages").insert({ ...page, is_complete: false }));
    console.log(`  ✓ page ${page.title}`);
  }
  const count = must("faq", await supabase.from("faq_items").select("id"));
  if (count.length === 0) {
    check(
      "faq",
      await supabase.from("faq_items").insert(SEED_FAQ.map((f, i) => ({ ...f, sort_order: i + 1 }))),
    );
    console.log(`  ✓ ${SEED_FAQ.length} questions de FAQ`);
  }
}

async function seedShipping() {
  const zones = must("zones", await supabase.from("shipping_zones").select("id"));
  if (zones.length > 0) return;
  check("zones", await supabase.from("shipping_zones").insert(SEED_SHIPPING_ZONES));
  console.log("  ✓ zone de livraison (tarif indicatif à vérifier)");
}

async function seedCatalog(media: Record<string, string>) {
  let collection = check(
    "collection",
    await supabase.from("collections").select("id").eq("slug", SEED_COLLECTION.slug).maybeSingle(),
  );
  if (!collection) {
    collection = must(
      "collection",
      await supabase
        .from("collections")
        .insert({
          slug: SEED_COLLECTION.slug,
          name: SEED_COLLECTION.name,
          description: SEED_COLLECTION.description,
          image_id: media[SEED_COLLECTION.image],
          sort_order: 1,
        })
        .select("id")
        .single(),
    );
    console.log(`  ✓ collection ${SEED_COLLECTION.name}`);
  }

  const collectionId = collection.id;
  for (const p of SEED_PRODUCTS) {
    const existing = check(
      `produit ${p.slug}`,
      await supabase.from("products").select("id").eq("slug", p.slug).maybeSingle(),
    );
    if (existing) continue;
    const { variants, story_image, ...fields } = p;
    const product = must(
      `produit ${p.slug}`,
      await supabase
        .from("products")
        .insert({
          ...fields,
          status: "published",
          published_at: new Date().toISOString(),
          stock_mode: "made_to_order",
          is_featured: true,
          name_enabled: true,
          name_required: true,
          name_max_length: 12,
          phone_enabled: true,
          phone_required: false,
          phone_max_length: 20,
          story_image_id: story_image ? media[story_image] : null,
        })
        .select("id")
        .single(),
    );

    let imageOrder = 10;
    for (const [index, v] of variants.entries()) {
      const variant = must(
        `variante ${v.name}`,
        await supabase
          .from("product_variants")
          .insert({
            product_id: product.id,
            name: v.name,
            finish: v.finish,
            swatch: v.swatch,
            sort_order: index + 1,
            sku: `${p.slug}-${v.finish}`.toUpperCase(),
          })
          .select("id")
          .single(),
      );
      for (const img of v.images) {
        const first = "imageFirst" in v && v.imageFirst;
        check(
          "photo produit",
          await supabase.from("product_images").insert({
            product_id: product.id,
            media_id: media[img],
            variant_id: variant.id,
            sort_order: first ? 0 : imageOrder++,
          }),
        );
      }
    }
    check(
      "collection produit",
      await supabase
        .from("product_collections")
        .insert({ product_id: product.id, collection_id: collectionId, sort_order: p.sort_order }),
    );
    console.log(`  ✓ produit ${p.name} (${variants.length} finitions)`);
  }
}

async function main() {
  console.log("Données initiales Mademoizelle Jane");
  const media = await seedMedia();
  await seedSettings(media);
  await seedPagesAndFaq();
  await seedShipping();
  await seedCatalog(media);
  console.log("Terminé.");
}

main().catch((error) => {
  console.error(`Échec : ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
