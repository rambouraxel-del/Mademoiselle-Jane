"use client";

import { deleteFaq, reorderFaq, saveFaq } from "@/app/admin/actions/content";
import { ActionForm, ConfirmAction, SubmitButton } from "./forms";
import { ReorderList } from "./reorder-list";
import { Card, inputClass, labelClass } from "./ui";

type Faq = { id: string; question: string; answer: string; is_published: boolean };

function FaqFields({ item }: { item?: Faq }) {
  return (
    <>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div>
        <label className={labelClass} htmlFor={`q-${item?.id ?? "new"}`}>Question</label>
        <input id={`q-${item?.id ?? "new"}`} name="question" defaultValue={item?.question} maxLength={300} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor={`a-${item?.id ?? "new"}`}>Réponse</label>
        <textarea id={`a-${item?.id ?? "new"}`} name="answer" defaultValue={item?.answer} rows={3} maxLength={4000} required className={inputClass} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={item?.is_published ?? true} className="h-4 w-4 accent-[var(--color-rose)]" />
        Visible sur le site
      </label>
    </>
  );
}

export function FaqEditor({ items }: { items: Faq[] }) {
  return (
    <div className="space-y-6">
      <Card title="Ajouter une question">
        <ActionForm action={saveFaq} resetOnSuccess>
          <FaqFields />
          <SubmitButton>Ajouter</SubmitButton>
        </ActionForm>
      </Card>
      {items.length > 1 ? (
        <Card title="Ordre d’affichage">
          <ReorderList key={items.map((i) => i.id).join()} items={items.map((i) => ({ id: i.id, label: i.question }))} onSave={reorderFaq} />
        </Card>
      ) : null}
      {items.map((item) => (
        <Card key={item.id}>
          <ActionForm action={saveFaq}>
            <FaqFields item={item} />
            <div className="flex flex-wrap items-center gap-2">
              <SubmitButton>Enregistrer</SubmitButton>
            </div>
          </ActionForm>
          <div className="mt-3">
            <ConfirmAction
              action={deleteFaq}
              fields={{ id: item.id }}
              label="Supprimer"
              confirmTitle="Supprimer cette question ?"
              confirmText={`« ${item.question} » sera supprimée définitivement.`}
              confirmLabel="Supprimer"
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
