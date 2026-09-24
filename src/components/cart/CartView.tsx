"use client";

import { useCart } from "@/context/CartContext";
import { CartLineItem } from "./CartLineItem";
import { CartSummaryPanel } from "./CartSummary";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Button } from "@/components/ui/Button";

export function CartView() {
  const { items, summary, hydrated, clearCart } = useCart();

  if (!hydrated) {
    return (
      <div className="container-site py-24 text-center text-ink-soft" role="status">
        Chargement du panier…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-site flex flex-col items-center gap-4 py-24 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Panier</span>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Votre panier est vide</h1>
        <p className="max-w-md text-ink-soft">
          Parcourez la boutique pour trouver la médaille parfaite et commencer sa personnalisation.
        </p>
        <ButtonLink href="/boutique" size="lg" className="mt-2">
          Découvrir la boutique
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="container-site py-12 sm:py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Panier</span>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            {summary.itemCount} article{summary.itemCount > 1 ? "s" : ""}
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          Vider le panier
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="rounded-card border border-border/70 bg-paper px-6">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </ul>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <CartSummaryPanel summary={summary} />
        </div>
      </div>
    </div>
  );
}
