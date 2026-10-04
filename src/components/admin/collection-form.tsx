"use client";

import { saveCollection } from "@/app/admin/actions/collections";
import type { MediaItem } from "@/lib/admin/types";
import { ActionForm, SubmitButton } from "./forms";
import { ImageField } from "./media-picker";
import { inputClass, labelClass } from "./ui";

export type CollectionInitial = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  image: MediaItem | null;
  isPublished: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
};

export function CollectionForm({ initial }: { initial: CollectionInitial }) {
  return (
    <ActionForm action={saveCollection}>
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="c-name" className={labelClass}>Nom</label>
          <input id="c-name" name="name" required maxLength={120} defaultValue={initial.name} className={inputClass} />
        </div>
        <div>
          <label htmlFor="c-slug" className={labelClass}>Adresse (dans le filtre boutique)</label>
          <input id="c-slug" name="slug" maxLength={80} defaultValue={initial.slug} placeholder="générée depuis le nom" className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="c-desc" className={labelClass}>Description</label>
          <textarea id="c-desc" name="description" rows={3} maxLength={2000} defaultValue={initial.description} className={inputClass} />
        </div>
        <ImageField name="imageId" label="Image de la collection" initial={initial.image} />
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked={initial.isPublished} className="h-4 w-4 accent-[var(--color-rose)]" />
            Visible sur le site (filtre de la boutique)
          </label>
          <div className="max-w-[10rem]">
            <label htmlFor="c-order" className={labelClass}>Ordre</label>
            <input id="c-order" name="sortOrder" type="number" min={0} defaultValue={initial.sortOrder} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="c-seot" className={labelClass}>Titre SEO</label>
          <input id="c-seot" name="seoTitle" maxLength={70} defaultValue={initial.seoTitle} className={inputClass} />
        </div>
        <div>
          <label htmlFor="c-seod" className={labelClass}>Description SEO</label>
          <input id="c-seod" name="seoDescription" maxLength={170} defaultValue={initial.seoDescription} className={inputClass} />
        </div>
      </div>
      <SubmitButton>{initial.id ? "Enregistrer" : "Créer la collection"}</SubmitButton>
    </ActionForm>
  );
}
