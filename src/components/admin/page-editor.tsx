"use client";

import { useState } from "react";
import { savePage } from "@/app/admin/actions/content";
import { RichText, TOKEN_LABELS } from "@/components/rich-text";
import { ActionForm, SubmitButton } from "./forms";
import { Card, helpClass, inputClass, labelClass } from "./ui";

export function PageEditor({
  page,
  tokens,
}: {
  page: { slug: string; title: string; body: string; is_complete: boolean; seo_description: string };
  tokens: Record<string, string>;
}) {
  const [body, setBody] = useState(page.body);
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="Modifier">
        <ActionForm action={savePage}>
          <input type="hidden" name="slug" value={page.slug} />
          <div>
            <label htmlFor="pg-title" className={labelClass}>Titre</label>
            <input id="pg-title" name="title" defaultValue={page.title} maxLength={160} className={inputClass} />
          </div>
          <div>
            <label htmlFor="pg-body" className={labelClass}>Texte</label>
            <textarea id="pg-body" name="body" value={body} onChange={(e) => setBody(e.target.value)} rows={22} className={`${inputClass} font-mono text-[0.85rem]`} />
            <details className={helpClass}>
              <summary className="cursor-pointer">Aide à la mise en forme</summary>
              <ul className="mt-1 list-disc pl-5">
                <li><code>## Titre</code> et <code>### Sous-titre</code> en début de paragraphe</li>
                <li><code>- élément</code> pour une liste</li>
                <li><code>**texte**</code> pour du gras, <code>[texte](/adresse)</code> pour un lien</li>
                <li>Une ligne vide sépare deux paragraphes</li>
                <li>
                  Informations remplies automatiquement :{" "}
                  {Object.keys(TOKEN_LABELS).map((k) => (
                    <code key={k} className="mr-1">{`{{${k}}}`}</code>
                  ))}
                  <code>{"{{shipping_zones}}"}</code> (tableau des frais de livraison)
                </li>
              </ul>
            </details>
          </div>
          <div>
            <label htmlFor="pg-seo" className={labelClass}>Description pour Google</label>
            <input id="pg-seo" name="seoDescription" defaultValue={page.seo_description} maxLength={170} className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isComplete" defaultChecked={page.is_complete} className="h-4 w-4 accent-[var(--color-rose)]" />
            Page relue et validée (retire l’avertissement « en cours de rédaction »)
          </label>
          <SubmitButton>Enregistrer et publier</SubmitButton>
        </ActionForm>
      </Card>
      <Card title="Aperçu">
        <div className="text-[0.95rem]">
          <RichText
            source={body}
            tokens={tokens}
            blocks={{ shipping_zones: () => <p className="rounded bg-ivory p-2 text-sm text-brown-soft">[Tableau des zones et frais de livraison]</p> }}
          />
        </div>
      </Card>
    </div>
  );
}
