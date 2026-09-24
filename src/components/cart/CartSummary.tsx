import type { CartSummary as CartSummaryType } from "@/types";
import { formatPrice } from "@/utils/formatPrice";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function CartSummaryPanel({ summary }: { summary: CartSummaryType }) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-border/70 bg-paper p-6">
      <h2 className="font-display text-lg text-ink">Récapitulatif</h2>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-soft">Sous-total</dt>
          <dd className="font-medium text-ink">{formatPrice(summary.subtotalCents)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-soft">Livraison estimée</dt>
          <dd className="font-medium text-ink">
            {summary.shippingEstimateCents === 0 ? "Offerte" : formatPrice(summary.shippingEstimateCents)}
          </dd>
        </div>
      </dl>

      <div className="flex items-center justify-between border-t border-border/70 pt-4">
        <span className="font-medium text-ink">Total</span>
        <span className="font-display text-xl text-clay">{formatPrice(summary.totalCents)}</span>
      </div>

      <p className="text-xs text-ink-soft">
        Livraison estimative — le montant définitif sera calculé au paiement.
      </p>

      <ButtonLink href="/commande" size="lg" className="mt-2 justify-center">
        Passer commande
      </ButtonLink>
    </div>
  );
}
