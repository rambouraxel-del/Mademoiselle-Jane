import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { adminGetProduct } from "@/lib/admin/products";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Modifier un produit" };

const OK_MESSAGES: Record<string, string> = {
  cree: "Produit créé en brouillon. Ajoutez photos et finitions, puis publiez-le.",
  copie: "Copie créée en brouillon.",
};

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/produits/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const product = await adminGetProduct(admin, id);
  if (!product) notFound();
  const { data: collections } = await admin.supabase.from("collections").select("id, name").order("sort_order");
  const ok = typeof sp.ok === "string" ? OK_MESSAGES[sp.ok] : undefined;
  return (
    <>
      <PageHeader title={product.name} back={{ href: "/admin/produits", label: "Produits" }} />
      <ProductForm key={product.updatedAt} product={product} collections={collections ?? []} okMessage={ok} />
    </>
  );
}
