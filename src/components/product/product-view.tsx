"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { addToCart } from "@/components/cart/cart-store";
import { BagIcon, CheckIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { galleryForVariant } from "@/lib/catalog/map";
import type { Product } from "@/lib/catalog/types";
import { validatePersonalization } from "@/lib/cart/personalization";
import { MAX_QUANTITY_PER_LINE } from "@/lib/cart/types";
import { formatPrice } from "@/lib/format";

type Props = {
  product: Product;
  initialVariantId: string | null;
  notice: string;
  fabricationDelay: string;
  /** Aperçu administrateur : l'ajout au panier est désactivé. */
  preview?: boolean;
};

export function ProductView({ product, initialVariantId, notice, fabricationDelay, preview }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const id = useId();
  const variants = product.variants.filter((v) => v.isActive);
  const [variantId, setVariantId] = useState<string | null>(initialVariantId ?? variants[0]?.id ?? null);
  const variant = variants.find((v) => v.id === variantId) ?? null;
  const gallery = useMemo(() => galleryForVariant(product, variantId), [product, variantId]);
  const [imageIndex, setImageIndex] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  const unitPrice = variant?.priceCents ?? product.basePriceCents;
  const available = product.isAvailable && (variant ? variant.available : variants.length === 0);
  const { value: perso, errors } = validatePersonalization(product.personalization, { name, phone });
  const showErrors = submitted;
  const main = gallery[Math.min(imageIndex, Math.max(0, gallery.length - 1))] ?? null;

  function selectVariant(next: string) {
    setVariantId(next);
    setImageIndex(0);
    setAdded(null);
    const v = variants.find((x) => x.id === next);
    if (v) router.replace(`${pathname}?finition=${encodeURIComponent(v.finish || v.id)}`, { scroll: false });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setCartError(null);
    if (preview || !available) return;
    if (Object.keys(errors).length > 0) return;
    try {
      addToCart({
        productId: product.id,
        variantId: variant?.id ?? null,
        quantity,
        personalization: perso,
        display: {
          productName: product.name,
          variantName: variant?.name ?? "",
          slug: product.slug,
          imageUrl: (gallery[0] ?? product.images[0])?.media.url ?? null,
          unitPriceCents: unitPrice,
          sizeLabel: product.sizeLabel,
        },
      });
      setAdded(`${product.name}${variant ? ` — ${variant.name}` : ""}${perso.name ? ` · ${perso.name}` : ""}`);
      setName("");
      setPhone("");
      setQuantity(1);
      setSubmitted(false);
    } catch (err) {
      setCartError(err instanceof Error ? err.message : "Ajout impossible.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-14">
      {/* Galerie */}
      <div>
        <div className="relative aspect-[562/477] overflow-hidden rounded-[3px] bg-beige">
          {main ? (
            <Image
              key={main.id}
              src={main.media.url}
              alt={main.alt}
              fill
              priority
              quality={90}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              style={{ objectPosition: `${main.media.focalX}% ${main.media.focalY}%` }}
            />
          ) : null}
        </div>
        {gallery.length > 1 ? (
          <ul className="mt-4 grid grid-cols-3 gap-4 sm:gap-5" aria-label="Autres photos">
            {gallery.slice(0, 6).map((img, i) => (
              <li key={img.id}>
                <button
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-pressed={i === imageIndex}
                  className={`relative block aspect-[176/165] w-full overflow-hidden rounded-[2px] border-2 transition ${
                    i === imageIndex ? "border-rose-deco" : "border-transparent hover:border-blush-line"
                  }`}
                >
                  <Image
                    src={img.media.url}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 16vw, 30vw"
                    className="object-cover"
                    style={{ objectPosition: `${img.media.focalX}% ${img.media.focalY}%` }}
                  />
                  <span className="visually-hidden">Afficher la photo {i + 1} : {img.alt}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Achat */}
      <form onSubmit={onSubmit} noValidate className="lg:pt-1">
        <p className="eyebrow !text-[0.75rem] !tracking-[0.28em] !text-rose-text">Les médailles</p>
        <h1 className="mt-3 text-[2.6rem] sm:text-[3.1rem]">{product.name}</h1>
        {product.shortDescription ? (
          <p className="mt-3 max-w-xl font-serif text-[1.3rem] leading-snug text-brown">{product.shortDescription}</p>
        ) : null}
        <p className="mt-4 font-serif text-[2.1rem] text-[#6e3438]" aria-live="polite">
          {formatPrice(unitPrice)}
        </p>
        {product.personalization.name.enabled ? (
          <span className="mt-3 inline-block rounded-full bg-blush px-4 py-1.5 text-[0.75rem] font-medium tracking-[0.2em] text-ink">
            PERSONNALISABLE
          </span>
        ) : null}

        <div className="mt-6 space-y-5 border-t border-line pt-5">
          {variants.length > 0 ? (
            <fieldset>
              <legend className="field-label">Finition</legend>
              <div className="flex flex-wrap gap-3">
                {variants.map((v) => {
                  const selected = v.id === variantId;
                  return (
                    <label
                      key={v.id}
                      className={`relative inline-flex min-h-11 min-w-[6.5rem] cursor-pointer items-center justify-center gap-2 rounded-full border px-6 text-[0.98rem] transition focus-within:ring-2 focus-within:ring-rose/40 ${
                        selected
                          ? "border-rose bg-rose text-white ring-2 ring-rose ring-offset-2 ring-offset-ivory"
                          : "border-line-strong bg-ivory-deep text-ink hover:border-rose"
                      }`}
                    >
                      <input
                        type="radio"
                        name="finition"
                        value={v.id}
                        checked={selected}
                        onChange={() => selectVariant(v.id)}
                        className="visually-hidden"
                      />
                      {v.swatch ? (
                        <span
                          aria-hidden="true"
                          className="h-3.5 w-3.5 rounded-full border border-black/10"
                          style={{ background: v.swatch }}
                        />
                      ) : null}
                      {v.name}
                      {!v.available ? <span className="text-xs opacity-80">(indisponible)</span> : null}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {product.personalization.name.enabled ? (
            <div>
              <label htmlFor={`${id}-name`} className="field-label">
                Prénom de votre animal{product.personalization.name.required ? "" : " (facultatif)"}
              </label>
              <input
                id={`${id}-name`}
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={product.personalization.name.maxLength}
                autoComplete="off"
                placeholder="JANE"
                aria-invalid={showErrors && errors.name ? true : undefined}
                aria-describedby={`${id}-name-help`}
                required={product.personalization.name.required}
              />
              <p id={`${id}-name-help`} className={`mt-1 text-[0.8125rem] ${showErrors && errors.name ? "text-danger" : "text-brown-soft"}`}>
                {showErrors && errors.name
                  ? errors.name
                  : `${[...name].length}/${product.personalization.name.maxLength} caractères`}
              </p>
            </div>
          ) : null}

          {product.personalization.phone.enabled ? (
            <div>
              <label htmlFor={`${id}-phone`} className="field-label">
                Téléphone au dos{product.personalization.phone.required ? "" : " (facultatif)"}
              </label>
              <input
                id={`${id}-phone`}
                className="field-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={product.personalization.phone.maxLength}
                inputMode="tel"
                autoComplete="off"
                placeholder="Votre numéro"
                aria-invalid={showErrors && errors.phone ? true : undefined}
                aria-describedby={`${id}-phone-help`}
                required={product.personalization.phone.required}
              />
              {showErrors && errors.phone ? (
                <p id={`${id}-phone-help`} className="mt-1 text-[0.8125rem] text-danger">
                  {errors.phone}
                </p>
              ) : (
                <p id={`${id}-phone-help`} className="visually-hidden">
                  Numéro gravé au dos de la médaille
                </p>
              )}
            </div>
          ) : null}

          {product.sizeLabel ? (
            <div>
              <p className="field-label">Diamètre</p>
              <span className="inline-flex min-h-10 items-center rounded-full border border-blush-line bg-blush-soft px-7 text-[0.95rem] text-ink">
                {product.sizeLabel}
              </span>
            </div>
          ) : null}

          <div className="flex items-center gap-6">
            <span className="text-[0.95rem] text-ink" id={`${id}-qty-label`}>
              Quantité
            </span>
            <div className="inline-flex items-center border border-line-strong bg-[#fffdfa]" role="group" aria-labelledby={`${id}-qty-label`}>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="inline-flex h-10 w-10 items-center justify-center text-ink hover:text-rose-dark disabled:opacity-40"
                disabled={quantity <= 1}
              >
                <MinusIcon size={18} />
                <span className="visually-hidden">Diminuer la quantité</span>
              </button>
              <output className="w-10 border-x border-line-strong text-center leading-10 text-ink" aria-live="polite">
                {quantity}
              </output>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY_PER_LINE, q + 1))}
                className="inline-flex h-10 w-10 items-center justify-center text-ink hover:text-rose-dark disabled:opacity-40"
                disabled={quantity >= MAX_QUANTITY_PER_LINE}
              >
                <PlusIcon size={18} />
                <span className="visually-hidden">Augmenter la quantité</span>
              </button>
            </div>
          </div>

          {/* Récapitulatif fiable des choix (pas d'aperçu photoréaliste) */}
          <div className="rounded-[3px] border border-line bg-ivory-deep/70 px-4 py-3 text-[0.9rem]" aria-live="polite">
            <p className="font-medium text-ink">Récapitulatif</p>
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-brown">
              <dt>Modèle</dt>
              <dd className="text-ink">
                {product.name}
                {variant ? ` — ${variant.name}` : ""}
              </dd>
              {product.personalization.name.enabled ? (
                <>
                  <dt>Prénom</dt>
                  <dd className="break-words text-ink">{perso.name ?? "—"}</dd>
                </>
              ) : null}
              {product.personalization.phone.enabled ? (
                <>
                  <dt>Au dos</dt>
                  <dd className="break-words text-ink">{perso.phone ?? "—"}</dd>
                </>
              ) : null}
              {product.sizeLabel ? (
                <>
                  <dt>Diamètre</dt>
                  <dd className="text-ink">{product.sizeLabel}</dd>
                </>
              ) : null}
              <dt>Total</dt>
              <dd className="text-ink">
                {quantity} × {formatPrice(unitPrice)} = {formatPrice(quantity * unitPrice)}
              </dd>
            </dl>
            {notice ? <p className="mt-2 text-[0.8rem] leading-snug text-brown-soft">{notice}</p> : null}
          </div>

          {fabricationDelay ? (
            <p className="text-[0.9rem] text-brown-soft">Délai de fabrication indicatif : {fabricationDelay}</p>
          ) : null}
          {product.stockMode === "limited" && variant && variant.stockQuantity !== null && variant.available ? (
            <p className="text-[0.9rem] text-brown-soft">
              Stock limité : {variant.stockQuantity} disponible{variant.stockQuantity > 1 ? "s" : ""}
            </p>
          ) : null}

          <button type="submit" className="btn btn-primary w-full !py-3.5 !text-[1.1rem]" disabled={!available || preview}>
            <BagIcon size={22} />
            {preview
              ? "Aperçu : ajout désactivé"
              : available
                ? `Ajouter au panier — ${formatPrice(quantity * unitPrice)}`
                : "Indisponible pour le moment"}
          </button>

          <div aria-live="polite" role="status">
            {added ? (
              <div className="flex flex-col gap-3 rounded-[3px] border border-success/30 bg-success-bg px-4 py-3 text-[0.95rem] text-success sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2">
                  <CheckIcon size={18} /> Ajouté au panier : {added}
                </span>
                <Link href="/panier" className="font-medium underline underline-offset-2">
                  Voir le panier
                </Link>
              </div>
            ) : null}
            {cartError ? <p className="text-danger">{cartError}</p> : null}
            {showErrors && Object.keys(errors).length > 0 ? (
              <p className="text-[0.9rem] text-danger">Merci de corriger les champs indiqués.</p>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}
