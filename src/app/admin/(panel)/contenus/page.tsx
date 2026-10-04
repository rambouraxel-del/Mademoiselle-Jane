import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";
import { SECTIONS } from "@/lib/content/sections";

export const metadata: Metadata = { title: "Contenus du site" };

export default async function ContentIndexPage() {
  const admin = await requireAdmin();
  const { data: pages } = await admin.supabase.from("pages").select("slug, title, is_complete").order("sort_order");
  const { count } = await admin.supabase.from("faq_items").select("id", { count: "exact", head: true });
  return (
    <>
      <PageHeader
        title="Contenus du site"
        description="Modifiez les textes, images et liens. Les couleurs et typographies restent celles de la charte : la mise en page s’adapte automatiquement."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Pages et sections">
          <ul className="divide-y divide-line">
            {SECTIONS.map((s) => (
              <li key={s.key}>
                <Link href={`/admin/contenus/${s.key}`} className="block py-3 hover:text-rose-text">
                  <span className="font-medium text-ink">{s.title}</span>
                  <span className="block text-sm text-brown-soft">{s.description}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/admin/contenus/faq" className="block py-3 hover:text-rose-text">
                <span className="font-medium text-ink">Questions fréquentes (FAQ)</span>
                <span className="block text-sm text-brown-soft">{count ?? 0} question(s), affichées sur la page Contact.</span>
              </Link>
            </li>
          </ul>
        </Card>
        <Card title="Pages d’informations">
          <ul className="divide-y divide-line">
            {(pages ?? []).map((p) => (
              <li key={p.slug}>
                <Link href={`/admin/contenus/pages/${p.slug}`} className="flex items-center justify-between py-3 hover:text-rose-text">
                  <span className="font-medium text-ink">{p.title}</span>
                  <Badge tone={p.is_complete ? "ok" : "wait"}>{p.is_complete ? "Validée" : "À compléter"}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
