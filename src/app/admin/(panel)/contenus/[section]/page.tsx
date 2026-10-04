import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionForm } from "@/components/admin/section-form";
import { PageHeader } from "@/components/admin/ui";
import { mediaRowToItem } from "@/lib/admin/media";
import type { MediaItem } from "@/lib/admin/types";
import { requireAdmin } from "@/lib/auth/admin";
import { mergeSettings, sectionByKey } from "@/lib/content/sections";

export const metadata: Metadata = { title: "Modifier les contenus" };

export default async function SectionPage({ params }: PageProps<"/admin/contenus/[section]">) {
  const admin = await requireAdmin();
  const { section: key } = await params;
  const section = sectionByKey(key);
  if (!section) notFound();
  const { data: row } = await admin.supabase.from("site_settings").select("value").eq("key", section.key).maybeSingle();
  const values = mergeSettings(section.key, row?.value ?? null) as Record<string, string | boolean>;
  const imageKeys = section.groups.flatMap((g) => g.fields).filter((f) => f.type === "image").map((f) => f.key);
  const ids = imageKeys.map((k) => String(values[k] ?? "")).filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  const images: Record<string, MediaItem | null> = {};
  if (ids.length) {
    const { data } = await admin.supabase.from("media").select("*").in("id", ids);
    for (const k of imageKeys) {
      const m = data?.find((d) => d.id === values[k]);
      images[k] = m ? mediaRowToItem(m) : null;
    }
  }
  return (
    <>
      <PageHeader title={section.title} description={section.description} back={{ href: "/admin/contenus", label: "Contenus du site" }} />
      <SectionForm section={section} values={values} images={images} />
    </>
  );
}
