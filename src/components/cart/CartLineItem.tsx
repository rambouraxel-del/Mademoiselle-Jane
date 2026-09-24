"use client";

import Link from "next/link";
import type { CartItem } from "@/types";
import { formatPrice } from "@/utils/formatPrice";
import { useCart } from "@/context/CartContext";
import { MedalThumbnail } from "@/components/product/MedalThumbnail";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

export function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <li className="flex flex-col gap-4 border-b border-border/70 py-6 last:border-b-0 sm:flex-row">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
        <MedalThumbnail image={item.image} />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/boutique/${item.productSlug}`} className="font-display text-lg text-ink hover:text-clay">
              {item.productName}
            </Link>
            {item.variantName && <p className="text-sm text-ink-soft">{item.variantName}</p>}
          </div>
          <p className="font-medium text-ink">{formatPrice(item.lineTotalCents)}</p>
        </div>

        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
          {item.selectedOptions.map((option) => (
            <li key={option.optionId}>
              {option.optionLabel} : {option.valueLabel ?? option.textValue ?? (option.checked ? "oui" : "")}
            </li>
          ))}
          {item.customization.dogName && <li>Nom : {item.customization.dogName}</li>}
          {item.customization.phoneNumber && <li>Tél : {item.customization.phoneNumber}</li>}
          {item.customization.customText && <li>Texte : {item.customization.customText}</li>}
        </ul>

        <div className="mt-3 flex items-center justify-between">
          <QuantityStepper
            value={item.quantity}
            onChange={(quantity) => updateQuantity(item.id, quantity)}
            ariaLabel={`Quantité pour ${item.productName}`}
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="text-sm font-medium text-ink-soft hover:text-error"
          >
            Supprimer
          </button>
        </div>
      </div>
    </li>
  );
}
