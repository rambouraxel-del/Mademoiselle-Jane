"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { quoteCartAction, startCheckoutAction } from "@/app/actions/checkout";
import { removeLine, setQuantity, useCart } from "@/components/cart/cart-store";
import { ArrowRightIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";
import type { Quote } from "@/lib/checkout/pricing";
import { MAX_QUANTITY_PER_LINE } from "@/lib/cart/types";
import { countryName, formatPrice } from "@/lib/format";

const noopSubscribe = () => () => {};

type Props = {
  countries: string[];
  paymentEnabled: boolean;
  testMode: boolean;
};

export function CartView({ countries, paymentEnabled, testMode }: Props) {
  const lines = useCart();
  const [country, setCountry] = useState(countries.includes("FR") ? "FR" : (countries[0] ?? "FR"));
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [quoting, startQuote] = useTransition();
  const [redirecting, startCheckout] = useTransition();
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const payload = useMemo(
    () =>
      lines.map((l) => ({
        key: l.key,
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
        personalization: l.personalization,
      })),
    [lines],
  );

  useEffect(() => {
    if (payload.length === 0) return;
    startQuote(async () => {
      const result = await quoteCartAction(payload, country);
      if ("error" in result) {
        setQuoteError(result.error);
        setQuote(null);
      } else {
        setQuoteError(null);
        setQuote(result);
      }
    });
  }, [payload, country]);

  function checkout() {
    setCheckoutError(null);
    startCheckout(async () => {
      const result = await startCheckoutAction(payload, country);
      if (result.ok) {
        window.location.assign(result.url);
      } else {
        setCheckoutError(result.error);
        if (result.quote) setQuote(result.quote);
      }
    });
  }

  if (!hydrated) {
    return <p className="py-16 text-center text-brown-soft">Chargement du panier…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-[3px] border border-dashed border-line-strong px-6 py-16 text-center">
        <p className="font-serif text-2xl text-ink">Votre panier est vide.</p>
        <Link href="/medailles" className="btn btn-primary mt-6">
          Découvrir les médailles <ArrowRightIcon size={20} />
        </Link>
      </div>
    );
  }

  const priced = new Map(quote?.lines.map((l) => [l.key, l]) ?? []);
  // Le devis affiché doit correspondre exactement au panier actuel.
  const quoteMatches = quote !== null && quote.lines.length === lines.length && lines.every((l) => {
    const p = priced.get(l.key);
    return p !== undefined && p.quantity === l.quantity;
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
      <section aria-label="Articles">
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((line) => {
            const p = priced.get(line.key);
            const unit = p?.unitPriceCents ?? line.display.unitPriceCents;
            return (
              <li key={line.key} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-6">
                <div className="relative aspect-square overflow-hidden rounded-[3px] bg-beige">
                  {line.display.imageUrl ? (
                    <Image src={p?.imageUrl ?? line.display.imageUrl} alt="" fill sizes="112px" className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif text-[1.35rem] leading-tight">
                    <Link href={`/medailles/${line.display.slug}`} className="hover:text-rose-text">
                      {line.display.productName}
                    </Link>
                  </h2>
                  <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 text-[0.9rem] text-brown">
                    {line.display.variantName ? (
                      <>
                        <dt className="text-brown-soft">Finition</dt>
                        <dd>{line.display.variantName}</dd>
                      </>
                    ) : null}
                    {line.personalization.name ? (
                      <>
                        <dt className="text-brown-soft">Prénom</dt>
                        <dd className="break-words font-medium text-ink">{line.personalization.name}</dd>
                      </>
                    ) : null}
                    {line.personalization.phone ? (
                      <>
                        <dt className="text-brown-soft">Au dos</dt>
                        <dd className="break-words">{line.personalization.phone}</dd>
                      </>
                    ) : null}
                    {line.display.sizeLabel ? (
                      <>
                        <dt className="text-brown-soft">Diamètre</dt>
                        <dd>{line.display.sizeLabel}</dd>
                      </>
                    ) : null}
                  </dl>
                  {p?.error ? (
                    <p className="mt-2 text-[0.9rem] text-danger" role="alert">
                      {p.error}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center gap-4">
                    <div className="inline-flex items-center border border-line-strong bg-[#fffdfa]">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.key, line.quantity - 1)}
                        disabled={line.quantity <= 1}
                        className="inline-flex h-9 w-9 items-center justify-center hover:text-rose-dark disabled:opacity-40"
                      >
                        <MinusIcon size={16} />
                        <span className="visually-hidden">Diminuer la quantité de {line.display.productName}</span>
                      </button>
                      <span className="w-9 border-x border-line-strong text-center leading-9" aria-label={`Quantité ${line.quantity}`}>
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.key, line.quantity + 1)}
                        disabled={line.quantity >= MAX_QUANTITY_PER_LINE}
                        className="inline-flex h-9 w-9 items-center justify-center hover:text-rose-dark disabled:opacity-40"
                      >
                        <PlusIcon size={16} />
                        <span className="visually-hidden">Augmenter la quantité de {line.display.productName}</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      className="inline-flex items-center gap-1.5 text-[0.875rem] text-brown-soft hover:text-danger"
                    >
                      <TrashIcon size={17} /> Retirer
                    </button>
                  </div>
                </div>
                <p className="col-start-2 font-serif text-[1.3rem] text-ink sm:col-start-3 sm:text-right">
                  {formatPrice(unit * line.quantity)}
                </p>
              </li>
            );
          })}
        </ul>
        <Link href="/medailles" className="mt-5 inline-flex items-center gap-2 text-[0.95rem] text-brown hover:text-rose-text">
          Continuer mes achats <ArrowRightIcon size={18} />
        </Link>
      </section>

      <aside aria-label="Récapitulatif de commande" className="h-fit rounded-[3px] bg-blush-soft p-6 lg:sticky lg:top-6">
        <h2 className="text-[1.8rem]">Récapitulatif</h2>
        <div className="mt-4">
          <label htmlFor="cart-country" className="field-label">
            Pays de livraison
          </label>
          <select
            id="cart-country"
            className="field-input"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {countryName(c)}
              </option>
            ))}
          </select>
        </div>
        <dl className="mt-5 space-y-2 text-[1rem]" aria-live="polite" aria-busy={quoting}>
          <div className="flex justify-between">
            <dt>Sous-total</dt>
            <dd>{quote ? formatPrice(quote.subtotalCents) : "…"}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Livraison{quote?.zone ? ` (${quote.zone.name})` : ""}</dt>
            <dd>{quote ? (quote.zone ? (quote.shippingCents === 0 ? "Offerte" : formatPrice(quote.shippingCents)) : "—") : "…"}</dd>
          </div>
          <div className="flex justify-between border-t border-blush-line pt-3 font-serif text-[1.45rem] text-ink">
            <dt>Total</dt>
            <dd>{quote ? formatPrice(quote.totalCents) : "…"}</dd>
          </div>
        </dl>
        {quote?.zone?.delayText ? <p className="mt-2 text-[0.85rem] text-brown-soft">Livraison : {quote.zone.delayText}</p> : null}
        <p className="mt-2 text-[0.8rem] text-brown-soft">Prix vérifiés par la boutique au moment du paiement.</p>

        {quoteError ? <p className="mt-4 text-danger">{quoteError}</p> : null}
        {quote && quote.issues.length > 0 ? (
          <ul className="mt-4 space-y-1 text-[0.9rem] text-danger" role="alert">
            {quote.issues.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        ) : null}

        {paymentEnabled ? (
          <button
            type="button"
            onClick={checkout}
            disabled={!quote?.valid || !quoteMatches || quoting || redirecting}
            className="btn btn-primary mt-5 w-full !py-3.5"
          >
            {redirecting ? "Redirection vers le paiement…" : "Passer au paiement sécurisé"}
          </button>
        ) : (
          <p className="mt-5 rounded-[3px] border border-warning/30 bg-warning-bg px-4 py-3 text-[0.95rem] text-warning">
            Le paiement en ligne n’est pas encore activé. Revenez très bientôt !
          </p>
        )}
        {testMode ? (
          <p className="mt-3 text-[0.8rem] text-brown-soft">
            Mode test Stripe : utilisez une carte de test, aucun paiement réel ne sera encaissé.
          </p>
        ) : null}
        {checkoutError ? (
          <p className="mt-3 text-[0.95rem] text-danger" role="alert">
            {checkoutError}
          </p>
        ) : null}
        <p className="mt-4 text-[0.8rem] text-brown-soft">
          Paiement sécurisé par Stripe. Vos coordonnées de livraison vous seront demandées à l’étape suivante. En
          validant, vous acceptez les{" "}
          <Link href="/infos/cgv" className="underline underline-offset-2">
            conditions générales de vente
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}
