import { formatPrice } from "@/lib/format";
import type { PublicOrder } from "@/lib/orders/public";

export function OrderSummary({ order }: { order: PublicOrder }) {
  return (
    <div className="rounded-[3px] border border-line bg-[#fffdfa] p-5 sm:p-6">
      <ul className="divide-y divide-line">
        {order.items.map((item, i) => (
          <li key={i} className="flex justify-between gap-4 py-3">
            <div>
              <p className="font-serif text-[1.2rem] text-ink">
                {item.productName}
                {item.variantName ? ` — ${item.variantName}` : ""} × {item.quantity}
              </p>
              {item.personalization.name ? <p className="text-[0.9rem]">Prénom : {item.personalization.name}</p> : null}
              {item.personalization.phone ? <p className="text-[0.9rem]">Téléphone au dos : {item.personalization.phone}</p> : null}
            </div>
            <p className="whitespace-nowrap">{formatPrice(item.lineTotalCents)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1 border-t border-line pt-3">
        <div className="flex justify-between">
          <dt>Sous-total</dt>
          <dd>{formatPrice(order.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Livraison ({order.shippingZoneName})</dt>
          <dd>{formatPrice(order.shippingCents)}</dd>
        </div>
        <div className="flex justify-between font-serif text-[1.3rem] text-ink">
          <dt>Total</dt>
          <dd>{formatPrice(order.totalCents)}</dd>
        </div>
      </dl>
    </div>
  );
}
