import type { Metadata } from "next";
import { CollectionForm } from "@/components/admin/collection-form";
import { Card, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Nouvelle collection" };

export default async function NewCollectionPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Nouvelle collection" back={{ href: "/admin/collections", label: "Collections" }} />
      <Card>
        <CollectionForm
          initial={{ id: null, name: "", slug: "", description: "", image: null, isPublished: true, sortOrder: 10, seoTitle: "", seoDescription: "" }}
        />
      </Card>
    </>
  );
}
