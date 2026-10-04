"use client";

import { useState } from "react";
import { updateOrderFulfillment } from "@/app/admin/actions/orders";
import { FULFILLMENT_LABELS, FULFILLMENT_ORDER, type FulfillmentStatus } from "@/lib/orders/labels";
import { ActionForm, SubmitButton } from "./forms";
import { helpClass, inputClass, labelClass } from "./ui";

export function OrderFulfillmentForm({
  order,
}: {
  order: { id: string; fulfillmentStatus: FulfillmentStatus; carrier: string; trackingNumber: string; trackingUrl: string; internalNote: string; paid: boolean; shippingEmailSent: boolean };
}) {
  const [status, setStatus] = useState(order.fulfillmentStatus);
  return (
    <ActionForm action={updateOrderFulfillment}>
      <input type="hidden" name="id" value={order.id} />
      <div>
        <label htmlFor="ful-status" className={labelClass}>Statut de préparation</label>
        <select id="ful-status" name="fulfillmentStatus" value={status} onChange={(e) => setStatus(e.target.value as FulfillmentStatus)} className={inputClass}>
          {FULFILLMENT_ORDER.map((s) => (
            <option key={s} value={s} disabled={!order.paid && s !== "new" && s !== "cancelled"}>
              {FULFILLMENT_LABELS[s]}
            </option>
          ))}
        </select>
        {!order.paid ? <p className={helpClass}>Commande non payée : la fabrication et l’expédition sont bloquées.</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="ful-carrier" className={labelClass}>Transporteur</label>
          <input id="ful-carrier" name="carrier" defaultValue={order.carrier} maxLength={80} placeholder="La Poste, Mondial Relay…" className={inputClass} />
        </div>
        <div>
          <label htmlFor="ful-number" className={labelClass}>Numéro de suivi</label>
          <input id="ful-number" name="trackingNumber" defaultValue={order.trackingNumber} maxLength={80} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="ful-url" className={labelClass}>Lien de suivi (facultatif)</label>
        <input id="ful-url" name="trackingUrl" type="url" defaultValue={order.trackingUrl} maxLength={500} placeholder="https://…" className={inputClass} />
      </div>
      <div>
        <label htmlFor="ful-note" className={labelClass}>Note interne (jamais visible par le client)</label>
        <textarea id="ful-note" name="internalNote" defaultValue={order.internalNote} rows={4} maxLength={5000} className={inputClass} />
      </div>
      {status === "shipped" ? (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="notify" defaultChecked={!order.shippingEmailSent} className="mt-0.5 h-4 w-4 accent-[var(--color-rose)]" />
          <span>
            Envoyer l’email d’expédition au client
            {order.shippingEmailSent ? <span className="block text-xs text-brown-soft">Déjà envoyé : il ne sera pas renvoyé.</span> : null}
          </span>
        </label>
      ) : null}
      <SubmitButton>Enregistrer</SubmitButton>
    </ActionForm>
  );
}
