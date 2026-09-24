"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/formatPrice";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function CheckoutPage() {
  const { items, summary, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div className="container-site py-24 text-center text-ink-soft" role="status">
        Chargement…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-site flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Votre panier est vide</h1>
        <p className="max-w-md text-ink-soft">Ajoutez une médaille avant de passer commande.</p>
        <ButtonLink href="/boutique" size="lg">
          Découvrir la boutique
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="container-site flex flex-col items-center gap-6 py-16 text-center sm:py-24">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Commande</span>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Le paiement arrive bientôt</h1>
      <p className="max-w-lg text-ink-soft">
        Cette version du site prépare votre commande mais ne prend pas encore les paiements.
        L&apos;intégration de Stripe et la création de compte (Supabase) seront ajoutées au
        prochain lot. Votre panier reste enregistré en attendant.
      </p>

      <div className="w-full max-w-sm rounded-card border border-border/70 bg-paper p-6 text-left">
        <h2 className="mb-3 font-display text-lg text-ink">Récapitulatif</h2>
        <ul className="flex flex-col gap-1.5 text-sm text-ink-soft">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>{formatPrice(item.lineTotalCents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border/70 pt-3 font-medium text-ink">
          <span>Total estimé</span>
          <span>{formatPrice(summary.totalCents)}</span>
        </div>
      </div>

      <ButtonLink href="/panier" variant="outline">
        ← Retour au panier
      </ButtonLink>
    </div>
  );
}
