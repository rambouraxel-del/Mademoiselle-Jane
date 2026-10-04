import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Nouveau produit" };

export default async function NewProductPage() {
  const admin = await requireAdmin();
  const { data: collections } = await admin.supabase.from("collections").select("id, name").order("sort_order");
  return (
    <>
      <PageHeader title="Nouveau produit" back={{ href: "/admin/produits", label: "Produits" }} description="Le produit est créé en brouillon : il ne sera visible qu’après publication." />
      <ProductForm product={null} collections={collections ?? []} />
    </>
  );
}
