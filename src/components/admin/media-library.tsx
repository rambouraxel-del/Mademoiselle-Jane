"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMedia, updateMedia } from "@/app/admin/actions/media";
import type { MediaItem } from "@/lib/admin/types";
import { formatDate } from "@/lib/format";
import { ActionForm, ConfirmAction, SubmitButton } from "./forms";
import { UploadZone } from "./media-picker";
import { btnSecondary, inputClass, labelClass } from "./ui";

function FocalEditor({ item }: { item: MediaItem }) {
  const [focal, setFocal] = useState({ x: item.focalX, y: item.focalY });
  return (
    <ActionForm action={updateMedia}>
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="focalX" value={focal.x} />
      <input type="hidden" name="focalY" value={focal.y} />
      <div>
        <p className={labelClass}>Cadrage : cliquez sur la partie importante de la photo</p>
        <button
          type="button"
          className="relative block w-full overflow-hidden rounded-md border border-line"
          style={{ aspectRatio: `${item.width} / ${item.height}` }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setFocal({
              x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
              y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
            });
          }}
        >
          <Image src={item.url} alt="" fill sizes="(min-width: 768px) 30rem, 90vw" className="object-contain" />
          <span
            aria-hidden="true"
            className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-rose/70 shadow"
            style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
          />
          <span className="visually-hidden">Définir le point de cadrage</span>
        </button>
        <p className="mt-1 text-xs text-brown-soft">
          Point de cadrage : {focal.x} % × {focal.y} %. Il est conservé quand l’image est affichée dans un format différent.
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            ["Carré", "1/1"],
            ["Paysage", "4/3"],
            ["Bandeau", "16/7"],
          ].map(([label, ratio]) => (
            <div key={label}>
              <div className="relative w-full overflow-hidden rounded border border-line" style={{ aspectRatio: ratio }}>
                <Image src={item.url} alt="" fill sizes="120px" className="object-cover" style={{ objectPosition: `${focal.x}% ${focal.y}%` }} />
              </div>
              <p className="mt-0.5 text-center text-[0.7rem] text-brown-soft">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor={`alt-${item.id}`} className={labelClass}>
          Texte alternatif (description pour les personnes malvoyantes et le référencement)
        </label>
        <textarea id={`alt-${item.id}`} name="alt" defaultValue={item.alt} maxLength={300} rows={2} className={inputClass} />
      </div>
      <SubmitButton>Enregistrer</SubmitButton>
    </ActionForm>
  );
}

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<MediaItem | null>(null);

  return (
    <div className="space-y-6">
      <UploadZone onUploaded={() => router.refresh()} />
      {items.length === 0 ? (
        <p className="text-brown-soft">Aucune photo.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-md border border-line bg-white">
              <button type="button" onClick={() => setEditing(item)} className="relative block aspect-square w-full">
                <Image src={item.url} alt="" fill sizes="(min-width: 1024px) 18vw, 45vw" className="object-cover" style={{ objectPosition: `${item.focalX}% ${item.focalY}%` }} />
                {item.isPlaceholder ? (
                  <span className="absolute left-1.5 top-1.5 rounded bg-warning-bg px-1.5 py-0.5 text-[0.65rem] font-medium text-warning">
                    Provisoire (maquette)
                  </span>
                ) : null}
                <span className="visually-hidden">Modifier {item.alt || item.originalFilename}</span>
              </button>
              <div className="p-2 text-xs">
                <p className="line-clamp-2 min-h-8 text-brown" title={item.alt}>
                  {item.alt || <span className="text-danger">Texte alternatif manquant</span>}
                </p>
                <p className="mt-1 text-brown-soft">
                  {item.width}×{item.height} · {formatDate(item.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Modifier la photo">
          <div className="max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-t-lg bg-white p-5 sm:rounded-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl">Modifier la photo</h2>
              <button type="button" className={btnSecondary} onClick={() => setEditing(null)}>
                Fermer
              </button>
            </div>
            <FocalEditor key={editing.id} item={editing} />
            <div className="mt-6 border-t border-line pt-4">
              <ConfirmAction
                action={deleteMedia}
                fields={{ id: editing.id }}
                label="Supprimer cette photo"
                confirmTitle="Supprimer la photo ?"
                confirmText="La photo sera définitivement supprimée. Une photo encore utilisée (produit, collection, page) ne peut pas être supprimée."
                confirmLabel="Supprimer"
                onDone={(s) => {
                  if (s.ok) setEditing(null);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
