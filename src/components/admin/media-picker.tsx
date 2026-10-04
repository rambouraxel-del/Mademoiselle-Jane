"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { listMedia } from "@/app/admin/actions/media";
import type { MediaItem } from "@/lib/admin/types";
import { uploadFile } from "./media-upload";
import { Notice, btnPrimary, btnSecondary, inputClass } from "./ui";

/** Zone d'import (clic, glisser-déposer, appareil photo du téléphone). */
export function UploadZone({ onUploaded, multiple = true }: { onUploaded: (items: MediaItem[]) => void; multiple?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);

  async function handle(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErrors([]);
    const list = Array.from(files).slice(0, multiple ? 20 : 1);
    const done: MediaItem[] = [];
    const errs: string[] = [];
    for (const [i, f] of list.entries()) {
      setBusy(`Import ${i + 1}/${list.length} : ${f.name}`);
      const r = await uploadFile(f);
      if (r.ok) done.push(r.item);
      else errs.push(r.error);
    }
    setBusy(null);
    setErrors(errs);
    if (input.current) input.current.value = "";
    if (done.length) onUploaded(done);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void handle(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed px-4 py-8 text-center ${
          drag ? "border-rose bg-blush-soft" : "border-line-strong bg-ivory/60"
        }`}
      >
        <p className="text-sm text-brown">Glissez vos photos ici ou</p>
        <button type="button" className={btnPrimary} onClick={() => input.current?.click()} disabled={busy !== null}>
          {busy ? "Import en cours…" : "Choisir des photos"}
        </button>
        <p className="text-xs text-brown-soft">JPEG, PNG, WebP ou AVIF. Les photos sont redimensionnées automatiquement (2400 px max).</p>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/*"
          multiple={multiple}
          className="visually-hidden"
          onChange={(e) => void handle(e.target.files)}
          aria-label="Choisir des photos à importer"
        />
      </div>
      <div aria-live="polite" className="mt-2 space-y-2">
        {busy ? <p className="text-sm text-brown">{busy}</p> : null}
        {errors.length ? (
          <Notice tone="error">
            <ul className="list-disc pl-5">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Notice>
        ) : null}
      </div>
    </div>
  );
}

/** Fenêtre de choix d'une ou plusieurs photos (bibliothèque + import). */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple = false,
  title = "Choisir une photo",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (items: MediaItem[]) => void;
  multiple?: boolean;
  title?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setSelected([]);
  }

  const load = useCallback((query: string) => {
    startLoading(async () => {
      const r = await listMedia({ q: query });
      if (r.ok && r.data) {
        setItems(r.data.items);
        setError(null);
      } else if (!r.ok) setError(r.error);
    });
  }, []);

  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      load("");
    } else {
      dialog.current?.close();
    }
  }, [open, load]);

  function toggle(item: MediaItem) {
    if (!multiple) {
      setSelected([item]);
      return;
    }
    setSelected((s) => (s.some((x) => x.id === item.id) ? s.filter((x) => x.id !== item.id) : [...s, item]));
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      className="m-auto h-[min(92dvh,52rem)] w-[min(96vw,60rem)] rounded-lg border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-ink/40"
      aria-label={title}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="font-serif text-xl">{title}</h2>
          <button type="button" className={btnSecondary} onClick={onClose}>
            Fermer
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <UploadZone
            multiple={multiple}
            onUploaded={(uploaded) => {
              setItems((prev) => [...uploaded, ...prev]);
              setSelected((s) => (multiple ? [...s, ...uploaded] : uploaded.slice(0, 1)));
            }}
          />
          <div className="flex gap-2" role="search">
            <label htmlFor="picker-search" className="visually-hidden">
              Rechercher une photo
            </label>
            <input
              id="picker-search"
              className={inputClass}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  load(q);
                }
              }}
              placeholder="Rechercher dans la bibliothèque (texte alternatif, nom de fichier)"
            />
            <button type="button" className={btnSecondary} onClick={() => load(q)}>
              Rechercher
            </button>
          </div>
          {error ? <Notice tone="error">{error}</Notice> : null}
          {loading ? <p className="text-sm text-brown-soft">Chargement…</p> : null}
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {items.map((item) => {
              const isSelected = selected.some((s) => s.id === item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item)}
                    aria-pressed={isSelected}
                    className={`relative block aspect-square w-full overflow-hidden rounded-md border-2 ${
                      isSelected ? "border-rose ring-2 ring-rose/30" : "border-transparent hover:border-line-strong"
                    }`}
                  >
                    <Image src={item.url} alt="" fill sizes="160px" className="object-cover" />
                    {item.isPlaceholder ? (
                      <span className="absolute left-1 top-1 rounded bg-warning-bg px-1 text-[0.6rem] text-warning">provisoire</span>
                    ) : null}
                    {isSelected ? (
                      <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose text-xs text-white">✓</span>
                    ) : null}
                    <span className="visually-hidden">{item.alt || item.originalFilename || "Photo sans description"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <span className="text-sm text-brown-soft">{selected.length} sélectionnée(s)</span>
          <button
            type="button"
            className={btnPrimary}
            disabled={selected.length === 0}
            onClick={() => {
              onSelect(selected);
              onClose();
            }}
          >
            Utiliser {multiple ? "ces photos" : "cette photo"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

/** Champ « image » réutilisable dans les formulaires (stocke l'identifiant du média). */
export function ImageField({
  name,
  label,
  initial,
  help,
}: {
  name: string;
  label: string;
  initial: MediaItem | null;
  help?: string;
}) {
  const [value, setValue] = useState<MediaItem | null>(initial);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="mb-1 block text-sm font-medium text-ink">{label}</p>
      <input type="hidden" name={name} value={value?.id ?? ""} />
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative h-24 w-32 overflow-hidden rounded-md border border-line bg-ivory">
          {value ? (
            <Image src={value.url} alt={value.alt} fill sizes="128px" className="object-cover" style={{ objectPosition: `${value.focalX}% ${value.focalY}%` }} />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-brown-soft">Aucune image</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnSecondary} onClick={() => setOpen(true)}>
            {value ? "Remplacer" : "Choisir une image"}
          </button>
          {value ? (
            <button type="button" className={btnSecondary} onClick={() => setValue(null)}>
              Retirer
            </button>
          ) : null}
        </div>
      </div>
      {help ? <p className="mt-1 text-xs text-brown-soft">{help}</p> : null}
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(items) => setValue(items[0] ?? null)} />
    </div>
  );
}
