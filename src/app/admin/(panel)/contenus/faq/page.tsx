import type { Metadata } from "next";
import { FaqEditor } from "@/components/admin/faq-editor";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqAdminPage() {
  const admin = await requireAdmin();
  const { data } = await admin.supabase.from("faq_items").select("id, question, answer, is_published").order("sort_order");
  return (
    <>
      <PageHeader title="Questions fréquentes" description="Affichées en bas de la page Contact." back={{ href: "/admin/contenus", label: "Contenus du site" }} />
      <FaqEditor items={data ?? []} />
    </>
  );
}
