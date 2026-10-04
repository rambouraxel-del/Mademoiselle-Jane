"use client";

import { useActionState } from "react";
import { lookupOrder } from "@/app/actions/order-lookup";
import { formatDate } from "@/lib/format";

export function OrderLookupForm() {
  const [state, action, pending] = useActionState(lookupOrder, null);
  return (
    <>
      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="lookup-number" className="field-label">
            Numéro de commande
          </label>
          <input id="lookup-number" name="number" className="field-input uppercase" required maxLength={30} placeholder="MJ-2026-00001" />
        </div>
        <div>
          <label htmlFor="lookup-email" className="field-label">
            Adresse e-mail utilisée pour la commande
          </label>
          <input id="lookup-email" name="email" type="email" className="field-input" required maxLength={254} autoComplete="email" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Recherche…" : "Voir ma commande"}
        </button>
      </form>
      <div aria-live="polite" className="mt-6">
        {state && !state.ok ? <p className="text-danger">{state.error}</p> : null}
        {state && state.ok ? (
          <div className="rounded-[3px] border border-line bg-[#fffdfa] p-5">
            <h2 className="text-[1.6rem]">Commande {state.order.number}</h2>
            <p className="text-brown-soft">Passée le {formatDate(state.order.createdAt)}</p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt>Paiement</dt>
              <dd className="text-ink">{state.order.payment}</dd>
              <dt>Préparation</dt>
              <dd className="text-ink">{state.order.fulfillment}</dd>
              {state.order.trackingNumber ? (
                <>
                  <dt>Suivi</dt>
                  <dd className="text-ink">
                    {state.order.carrier ? `${state.order.carrier} — ` : ""}
                    {state.order.trackingUrl ? (
                      <a href={state.order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-rose-text underline">
                        {state.order.trackingNumber}
                      </a>
                    ) : (
                      state.order.trackingNumber
                    )}
                  </dd>
                </>
              ) : null}
            </dl>
            <ul className="mt-3 list-disc pl-5 text-[0.95rem]">
              {state.order.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
}
