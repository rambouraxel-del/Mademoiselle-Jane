import type { Metadata } from "next";
import Link from "next/link";
import { MediaLibrary } from "@/components/admin/media-library";
import { Notice, PageHeader } from "@/components/admin/ui";
import { mediaRowToItem } from "@/lib/admin/media";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Photos et médias" };

export default async function MediaPage({ searchParams }: PageProps<"/admin/medias">) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const onlyPlaceholders = sp.provisoires === "1";
  let query = admin.supabase.from("media").select("*").order("created_at", { ascending: false }).limit(300);
  if (onlyPlaceholders) query = query.eq("is_placeholder", true);
  const { data } = await query;
  const items = (data ?? []).map(mediaRowToItem);
  const placeholders = items.filter((i) => i.isPlaceholder).length;

  return (
    <>
      <PageHeader
        title="Photos et médias"
        description="Importez vos photos depuis votre téléphone ou votre ordinateur, puis utilisez-les dans les produits, collections et contenus. Cliquez sur une photo pour modifier son texte alternatif ou son cadrage."
      />
      {placeholders > 0 || onlyPlaceholders ? (
        <div className="mb-4">
          <Notice tone="warning">
            Les visuels marqués « Provisoire » ont été extraits des maquettes pour démarrer. Remplacez-les par les photos
            originales des médailles (dans chaque produit : « Remplacer »).{" "}
            {onlyPlaceholders ? (
              <Link href="/admin/medias" className="underline">Voir toutes les photos</Link>
            ) : (
              <Link href="/admin/medias?provisoires=1" className="underline">Voir uniquement les provisoires</Link>
            )}
          </Notice>
        </div>
      ) : null}
      <MediaLibrary items={items} />
    </>
  );
}
