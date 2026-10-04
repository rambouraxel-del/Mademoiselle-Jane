import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageEditor } from "@/components/admin/page-editor";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";
import { mergeSettings } from "@/lib/content/sections";

export const metadata: Metadata = { title: "Page d’informations" };

export default async function InfoPageEditor({ params }: PageProps<"/admin/contenus/pages/[slug]">) {
  const admin = await requireAdmin();
  const { slug } = await params;
  const { data: page } = await admin.supabase.from("pages").select("*").eq("slug", slug).maybeSingle();
  if (!page) notFound();
  const { data: rows } = await admin.supabase.from("site_settings").select("key, value").in("key", ["commerce", "general"]);
  const commerce = mergeSettings("commerce", rows?.find((r) => r.key === "commerce")?.value ?? null);
  const general = mergeSettings("general", rows?.find((r) => r.key === "general")?.value ?? null);
  return (
    <>
      <PageHeader
        title={page.title}
        back={{ href: "/admin/contenus", label: "Contenus du site" }}
        description={<>Visible sur <a className="underline" href={`/infos/${page.slug}`} target="_blank">/infos/{page.slug}</a>. Les informations entre accolades viennent de « Informations commerciales et légales ».</>}
      />
      <PageEditor page={page} tokens={{ ...commerce, contact_email: general.contact_email } as Record<string, string>} />
    </>
  );
}
