import type { Metadata } from "next";
import Link from "next/link";
import { ShippingZoneForm } from "@/components/admin/shipping-zone-form";
import { Card, Notice, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";
import { isEmailConfigured, paymentMode } from "@/lib/env";

export const metadata: Metadata = { title: "Livraison et réglages" };

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const { data: zones } = await admin.supabase.from("shipping_zones").select("*").order("sort_order");
  const mode = paymentMode();
  return (
    <>
      <PageHeader title="Livraison et réglages" description="Frais de livraison, zones desservies et informations commerciales." />
      <div className="space-y-6">
        <Card title="Zones et frais de livraison">
          <p className="mb-4 text-sm text-brown-soft">
            Le pays choisi dans le panier détermine la zone et les frais. Un pays absent de toutes les zones actives ne peut pas être livré.
          </p>
          <div className="space-y-6">
            {(zones ?? []).map((z) => (
              <div key={z.id} className="rounded-md border border-line p-4">
                <ShippingZoneForm zone={z} />
              </div>
            ))}
            <div className="rounded-md border border-dashed border-line-strong p-4">
              <h3 className="mb-3 font-medium text-ink">Nouvelle zone</h3>
              <ShippingZoneForm zone={null} />
            </div>
          </div>
        </Card>
        <Card title="Informations commerciales et délais">
          <p className="text-sm">
            Délai de fabrication par défaut, mentions légales, SIRET, adresse, TVA… :{" "}
            <Link href="/admin/contenus/commerce" className="text-rose-text underline">Informations commerciales et légales</Link>.
            Le délai propre à chaque médaille se règle dans sa fiche produit.
          </p>
        </Card>
        <Card title="Services connectés">
          <ul className="space-y-2 text-sm">
            <li>
              Paiement :{" "}
              {mode === "live" ? "Stripe en mode réel" : mode === "test" ? "Stripe en mode test (aucun encaissement réel)" : "non configuré"}
            </li>
            <li>Emails : {isEmailConfigured() ? "configurés" : "non configurés"}</li>
          </ul>
          <div className="mt-3">
            <Notice tone="info">Ces services se configurent par les variables d’environnement de l’hébergeur (voir le guide d’installation).</Notice>
          </div>
        </Card>
      </div>
    </>
  );
}
