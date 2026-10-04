"use client";

import { deleteShippingZone, saveShippingZone } from "@/app/admin/actions/settings";
import { centsToInput } from "@/lib/format";
import { ActionForm, ConfirmAction, SubmitButton } from "./forms";
import { helpClass, inputClass, labelClass } from "./ui";

export type ZoneRow = {
  id: string;
  name: string;
  countries: string[];
  price_cents: number;
  free_from_cents: number | null;
  delay_text: string;
  is_active: boolean;
  sort_order: number;
};

export function ShippingZoneForm({ zone }: { zone: ZoneRow | null }) {
  const k = zone?.id ?? "new";
  return (
    <div className="space-y-3">
      <ActionForm action={saveShippingZone} resetOnSuccess={!zone}>
        {zone ? <input type="hidden" name="id" value={zone.id} /> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`z-name-${k}`} className={labelClass}>Nom de la zone</label>
            <input id={`z-name-${k}`} name="name" defaultValue={zone?.name} required maxLength={80} placeholder="France métropolitaine" className={inputClass} />
          </div>
          <div>
            <label htmlFor={`z-c-${k}`} className={labelClass}>Pays desservis (codes à 2 lettres)</label>
            <input id={`z-c-${k}`} name="countries" defaultValue={zone?.countries.join(", ")} required placeholder="FR, MC" className={inputClass} />
            <p className={helpClass}>FR France, BE Belgique, CH Suisse, LU Luxembourg, MC Monaco, DE, ES, IT…</p>
          </div>
          <div>
            <label htmlFor={`z-p-${k}`} className={labelClass}>Frais de livraison (€)</label>
            <input id={`z-p-${k}`} name="price" inputMode="decimal" defaultValue={zone ? centsToInput(zone.price_cents) : ""} required placeholder="4,90" className={inputClass} />
          </div>
          <div>
            <label htmlFor={`z-f-${k}`} className={labelClass}>Offerts à partir de (€, facultatif)</label>
            <input id={`z-f-${k}`} name="freeFrom" inputMode="decimal" defaultValue={zone?.free_from_cents != null ? centsToInput(zone.free_from_cents) : ""} className={inputClass} />
          </div>
          <div>
            <label htmlFor={`z-d-${k}`} className={labelClass}>Délai de livraison affiché (facultatif)</label>
            <input id={`z-d-${k}`} name="delayText" defaultValue={zone?.delay_text} maxLength={120} placeholder="Ex. 2 à 4 jours ouvrés après expédition" className={inputClass} />
          </div>
          <div className="flex items-end gap-4">
            <div className="w-24">
              <label htmlFor={`z-o-${k}`} className={labelClass}>Ordre</label>
              <input id={`z-o-${k}`} name="sortOrder" type="number" min={0} defaultValue={zone?.sort_order ?? 10} className={inputClass} />
            </div>
            <label className="mb-2 flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={zone?.is_active ?? true} className="h-4 w-4 accent-[var(--color-rose)]" />
              Active
            </label>
          </div>
        </div>
        <SubmitButton>{zone ? "Enregistrer" : "Ajouter la zone"}</SubmitButton>
      </ActionForm>
      {zone ? (
        <ConfirmAction
          action={deleteShippingZone}
          fields={{ id: zone.id }}
          label="Supprimer la zone"
          confirmTitle="Supprimer cette zone ?"
          confirmText="Les clients de ces pays ne pourront plus commander (sauf s’ils sont couverts par une autre zone). Les commandes passées ne changent pas."
          confirmLabel="Supprimer"
        />
      ) : null}
    </div>
  );
}
