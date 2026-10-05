import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Logo } from "@/components/site/logo";
import { getSettings, resolveImages } from "@/lib/content/queries";
import { isPreviewMode, isSupabaseConfigured, paymentMode } from "@/lib/env";

// Pages rendues à chaque visite : les modifications faites dans
// l'administration sont visibles immédiatement, sans redéploiement.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const preview = isPreviewMode();
  if (!preview && !isSupabaseConfigured()) {
    return (
      <main className="container-site py-24 text-center">
        <h1 className="text-4xl">Configuration requise</h1>
        <p className="mx-auto mt-4 max-w-xl">
          La base de données n’est pas encore connectée. Renseignez les variables Supabase décrites dans le README
          (fichier <code>.env.example</code>).
        </p>
      </main>
    );
  }

  const settings = await getSettings();
  const images = await resolveImages([settings.general.logo_media_id]);
  const customLogo = images[settings.general.logo_media_id] ?? null;
  const mode = paymentMode();

  return (
    <div className="flex min-h-dvh flex-col">
      {preview ? (
        <div className="bg-ink px-4 py-1.5 text-center text-xs tracking-wide text-white" role="note">
          Aperçu visuel du site : navigation et panier uniquement. Aucune commande, aucun paiement, aucun envoi.
        </div>
      ) : mode === "test" ? (
        <div className="bg-ink px-4 py-1.5 text-center text-xs tracking-wide text-white">
          Boutique en mode test : aucun paiement réel n’est encaissé.
        </div>
      ) : null}
      <Header
        announcement={settings.general.announcement_enabled ? settings.general.announcement_text : null}
        logo={<Logo custom={customLogo} alt={settings.general.logo_alt || "Mademoizelle Jane"} priority />}
      />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} logo={<Logo custom={customLogo} alt={settings.general.logo_alt || "Mademoizelle Jane"} />} />
    </div>
  );
}
