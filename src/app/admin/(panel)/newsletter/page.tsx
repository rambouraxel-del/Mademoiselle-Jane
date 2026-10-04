import type { Metadata } from "next";
import { deleteSubscriber } from "@/app/admin/actions/settings";
import { ConfirmAction } from "@/components/admin/forms";
import { Badge, EmptyState, Notice, PageHeader, btnSecondary } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Newsletter" };

const LABELS = { pending: "En attente de confirmation", confirmed: "Confirmé", unsubscribed: "Désinscrit" } as const;

export default async function NewsletterPage() {
  const admin = await requireAdmin();
  const { data } = await admin.supabase.from("newsletter_subscribers").select("id, email, status, consent_at, confirmed_at").order("created_at", { ascending: false }).limit(1000);
  const confirmed = (data ?? []).filter((s) => s.status === "confirmed").length;
  return (
    <>
      <PageHeader
        title="Newsletter"
        description={`${confirmed} abonné(s) confirmé(s). Seules les adresses confirmées ont donné leur consentement explicite.`}
        actions={<a href="/admin/newsletter/export" className={btnSecondary}>Exporter les confirmés (CSV)</a>}
      />
      <div className="mb-4">
        <Notice tone="info">
          Pour envoyer une newsletter, importez l’export CSV dans votre outil d’emailing (Brevo, Mailchimp…) et
          conservez-y un lien de désinscription. Pensez à retirer ensuite les personnes désinscrites ici.
        </Notice>
      </div>
      {!data?.length ? (
        <EmptyState>Aucune inscription pour le moment.</EmptyState>
      ) : (
        <ul className="divide-y divide-line rounded-md border border-line bg-white">
          {data.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <span>
                <span className="text-ink">{s.email}</span>
                <span className="block text-xs text-brown-soft">Consentement le {formatDateTime(s.consent_at)}</span>
              </span>
              <span className="flex items-center gap-2">
                <Badge tone={s.status === "confirmed" ? "ok" : s.status === "pending" ? "wait" : "neutral"}>{LABELS[s.status]}</Badge>
                <ConfirmAction action={deleteSubscriber} fields={{ id: s.id }} label="Supprimer" confirmTitle="Supprimer cette adresse ?" confirmText={`${s.email} sera retirée de la liste.`} confirmLabel="Supprimer" />
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
