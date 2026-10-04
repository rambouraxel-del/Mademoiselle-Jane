"use client";

import { reorderCollectionProducts, setCollectionMembership } from "@/app/admin/actions/collections";
import { ActionForm, SubmitButton } from "./forms";
import { ReorderList, type ReorderItem } from "./reorder-list";
import { btnSecondary, inputClass, labelClass } from "./ui";

export function CollectionProducts({
  collectionId,
  members,
  others,
}: {
  collectionId: string;
  members: ReorderItem[];
  others: { id: string; name: string }[];
}) {
  return (
    <div className="space-y-6">
      {members.length ? (
        <ReorderList key={members.map((m) => m.id).join()} items={members} onSave={(ids) => reorderCollectionProducts(collectionId, ids)} />
      ) : (
        <p className="text-sm text-brown-soft">Aucun produit dans cette collection.</p>
      )}
      {members.length ? (
        <ActionForm action={setCollectionMembership} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="collectionId" value={collectionId} />
          <input type="hidden" name="mode" value="remove" />
          <div className="min-w-48 flex-1">
            <label htmlFor="remove-product" className={labelClass}>Retirer un produit</label>
            <select id="remove-product" name="productId" className={inputClass}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <SubmitButton className={btnSecondary} pendingLabel="…">Retirer</SubmitButton>
        </ActionForm>
      ) : null}
      {others.length ? (
        <ActionForm action={setCollectionMembership} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="collectionId" value={collectionId} />
          <input type="hidden" name="mode" value="add" />
          <div className="min-w-48 flex-1">
            <label htmlFor="add-product" className={labelClass}>Ajouter un produit</label>
            <select id="add-product" name="productId" className={inputClass}>
              {others.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <SubmitButton pendingLabel="…">Ajouter</SubmitButton>
        </ActionForm>
      ) : null}
    </div>
  );
}
