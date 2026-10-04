import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge, EmptyState, Notice, PageHeader, btnPrimary } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";
import { publicMediaUrl } from "@/lib/media/url";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage({ searchParams }: PageProps<"/admin/collections">) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const { data } = await admin.supabase
    .from("collections")
    .select("id, name, slug, is_published, sort_order, image:media (path, bucket), product_collections (product_id)")
    .order("sort_order")
    .order("name");
  return (
    <>
      <PageHeader
        title="Collections"
        description="Regroupez les médailles (ex. « Petits cœurs ») : elles apparaissent dans le filtre de la boutique."
        actions={<Link href="/admin/collections/nouvelle" className={btnPrimary}>+ Nouvelle collection</Link>}
      />
      {sp.supprimee ? <div className="mb-4"><Notice tone="ok">Collection supprimée.</Notice></div> : null}
      {!data?.length ? (
        <EmptyState>Aucune collection.</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/collections/${c.id}`} className="block overflow-hidden rounded-md border border-line bg-white hover:border-rose">
                <span className="relative block aspect-[16/9] bg-ivory">
                  {c.image ? <Image src={publicMediaUrl(c.image.path, c.image.bucket)} alt="" fill sizes="320px" className="object-cover" /> : null}
                </span>
                <span className="flex items-center justify-between gap-2 p-3">
                  <span>
                    <span className="block font-medium text-ink">{c.name}</span>
                    <span className="text-sm text-brown-soft">{c.product_collections?.length ?? 0} produit(s)</span>
                  </span>
                  <Badge tone={c.is_published ? "ok" : "neutral"}>{c.is_published ? "Visible" : "Masquée"}</Badge>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
