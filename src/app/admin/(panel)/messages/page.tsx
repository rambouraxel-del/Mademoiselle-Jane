import type { Metadata } from "next";
import Link from "next/link";
import { deleteMessage, setMessageStatus } from "@/app/admin/actions/settings";
import { ActionForm, ConfirmAction, SubmitButton } from "@/components/admin/forms";
import { Badge, EmptyState, PageHeader, btnSecondary } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Messages" };

const LABELS = { new: "Nouveau", read: "Lu", archived: "Archivé" } as const;

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const filter = sp.statut === "archived" ? "archived" : sp.statut === "tous" ? "tous" : "boite";
  let query = admin.supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
  if (filter === "boite") query = query.neq("status", "archived");
  if (filter === "archived") query = query.eq("status", "archived");
  const { data } = await query;

  return (
    <>
      <PageHeader title="Messages" description="Messages envoyés depuis le formulaire de contact." />
      <nav aria-label="Filtrer" className="mb-4 flex gap-2">
        {[
          ["boite", "Boîte de réception"],
          ["archived", "Archivés"],
          ["tous", "Tous"],
        ].map(([v, l]) => (
          <Link key={v} href={`/admin/messages?statut=${v}`} aria-current={filter === v ? "page" : undefined} className={`rounded-full border px-3 py-1 text-sm ${filter === v ? "border-rose bg-rose text-white" : "border-line-strong bg-white"}`}>
            {l}
          </Link>
        ))}
      </nav>
      {!data?.length ? (
        <EmptyState>Aucun message.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {data.map((m) => (
            <li key={m.id} className={`rounded-md border bg-white p-4 ${m.status === "new" ? "border-rose" : "border-line"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">
                    {m.name} — <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "Votre message"}`)}`} className="text-rose-text underline">{m.email}</a>
                  </p>
                  <p className="text-xs text-brown-soft">
                    {formatDateTime(m.created_at)}
                    {m.order_number ? ` · Commande ${m.order_number}` : ""}
                  </p>
                </div>
                <Badge tone={m.status === "new" ? "info" : "neutral"}>{LABELS[m.status]}</Badge>
              </div>
              {m.subject ? <p className="mt-2 font-medium text-ink">{m.subject}</p> : null}
              <p className="mt-1 whitespace-pre-wrap text-sm text-brown">{m.message}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {m.status !== "read" ? (
                  <ActionForm action={setMessageStatus} className="inline">
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value="read" />
                    <SubmitButton className={btnSecondary} pendingLabel="…">Marquer comme lu</SubmitButton>
                  </ActionForm>
                ) : null}
                {m.status !== "archived" ? (
                  <ActionForm action={setMessageStatus} className="inline">
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value="archived" />
                    <SubmitButton className={btnSecondary} pendingLabel="…">Archiver</SubmitButton>
                  </ActionForm>
                ) : null}
                <ConfirmAction action={deleteMessage} fields={{ id: m.id }} label="Supprimer" confirmTitle="Supprimer ce message ?" confirmText="Le message sera définitivement supprimé." confirmLabel="Supprimer" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
