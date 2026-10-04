import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteCollection } from "@/app/admin/actions/collections";
import { CollectionForm } from "@/components/admin/collection-form";
import { CollectionProducts } from "@/components/admin/collection-products";
import { ConfirmAction } from "@/components/admin/forms";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { mediaRowToItem } from "@/lib/admin/media";
import { requireAdmin } from "@/lib/auth/admin";
import { publicMediaUrl } from "@/lib/media/url";

export const metadata: Metadata = { title: "Collection" };

export default async function CollectionPage({ params, searchParams }: PageProps<"/admin/collections/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: c } = await admin.supabase.from("collections").select("*, image:media (*)").eq("id", id).maybeSingle();
  if (!c) notFound();
  const [{ data: links }, { data: products }] = await Promise.all([
    admin.supabase
      .from("product_collections")
      .select("sort_order, product:products (id, name, status, product_images (sort_order, media (path, bucket)))")
      .eq("collection_id", id)
      .order("sort_order"),
    admin.supabase.from("products").select("id, name").neq("status", "archived").order("name"),
  ]);
  const members = (links ?? [])
    .filter((l) => l.product)
    .map((l) => {
      const img = [...(l.product!.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
      return {
        id: l.product!.id,
        label: l.product!.name,
        sublabel: l.product!.status === "published" ? "Publié" : l.product!.status === "draft" ? "Brouillon" : "Archivé",
        imageUrl: img?.media ? publicMediaUrl(img.media.path, img.media.bucket) : null,
      };
    });
  const memberIds = new Set(members.map((m) => m.id));

  return (
    <>
      <PageHeader title={c.name} back={{ href: "/admin/collections", label: "Collections" }} />
      {sp.ok ? <div className="mb-4"><Notice tone="ok">Collection créée.</Notice></div> : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card title="Informations">
          <CollectionForm
            initial={{
              id: c.id,
              name: c.name,
              slug: c.slug,
              description: c.description,
              image: c.image ? mediaRowToItem(c.image) : null,
              isPublished: c.is_published,
              sortOrder: c.sort_order,
              seoTitle: c.seo_title,
              seoDescription: c.seo_description,
            }}
          />
        </Card>
        <Card title="Produits et ordre d’affichage">
          <CollectionProducts collectionId={c.id} members={members} others={(products ?? []).filter((p) => !memberIds.has(p.id))} />
        </Card>
      </div>
      <div className="mt-8">
        <ConfirmAction
          action={deleteCollection}
          fields={{ id: c.id }}
          label="Supprimer la collection"
          confirmTitle="Supprimer cette collection ?"
          confirmText="Les produits ne sont pas supprimés : ils sont seulement retirés de cette collection."
          confirmLabel="Supprimer"
        />
      </div>
    </>
  );
}
