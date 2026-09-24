"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product, CartItemOptionSelection, ProductOption } from "@/types";
import { formatPrice } from "@/utils/formatPrice";
import { calculateUnitPriceCents } from "@/utils/pricing";
import {
  CUSTOMIZATION_LIMITS,
  hasCustomizationErrors,
  validateCustomization,
  type CustomizationErrors,
} from "@/utils/customization";
import { encodeMedalImage } from "@/utils/mediaCode";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { TextInput } from "@/components/ui/FormField";
import { cn } from "@/utils/cn";

type OptionSelectionState = {
  valueId?: string;
  textValue?: string;
  checked?: boolean;
};

function buildInitialSelections(options: ProductOption[]): Record<string, OptionSelectionState> {
  const initial: Record<string, OptionSelectionState> = {};
  for (const option of options) {
    if (option.type === "select" || option.type === "color" || option.type === "image") {
      initial[option.id] = { valueId: option.required ? option.values?.[0]?.id : undefined };
    } else if (option.type === "checkbox") {
      initial[option.id] = { checked: false };
    } else {
      initial[option.id] = { textValue: "" };
    }
  }
  return initial;
}

export function ProductCustomizer({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [selections, setSelections] = useState<Record<string, OptionSelectionState>>(() =>
    buildInitialSelections(product.options)
  );
  const [customization, setCustomization] = useState({
    dogName: "",
    phoneNumber: "",
    customText: "",
  });
  const [quantity, setQuantity] = useState(1);
  const [optionErrors, setOptionErrors] = useState<Record<string, string>>({});
  const [customizationErrors, setCustomizationErrors] = useState<CustomizationErrors>({});
  const [confirmation, setConfirmation] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === variantId);

  const resolvedOptions: CartItemOptionSelection[] = useMemo(() => {
    return product.options.flatMap((option): CartItemOptionSelection[] => {
      const selection = selections[option.id];
      if (!selection) return [];

      if (option.type === "select" || option.type === "color" || option.type === "image") {
        const value = option.values?.find((v) => v.id === selection.valueId);
        if (!value) return [];
        return [
          {
            optionId: option.id,
            optionLabel: option.label,
            valueId: value.id,
            valueLabel: value.label,
            priceModifierCents: value.priceModifierCents ?? 0,
          },
        ];
      }

      if (option.type === "checkbox") {
        if (!selection.checked) return [];
        return [
          {
            optionId: option.id,
            optionLabel: option.label,
            checked: true,
            priceModifierCents: option.priceModifierCents ?? 0,
          },
        ];
      }

      const text = selection.textValue?.trim();
      if (!text) return [];
      return [
        {
          optionId: option.id,
          optionLabel: option.label,
          textValue: text,
          priceModifierCents: 0,
        },
      ];
    });
  }, [product.options, selections]);

  const unitPriceCents = calculateUnitPriceCents(product, selectedVariant, resolvedOptions);

  function updateSelection(optionId: string, patch: OptionSelectionState) {
    setSelections((prev) => ({ ...prev, [optionId]: { ...prev[optionId], ...patch } }));
    setOptionErrors((prev) => ({ ...prev, [optionId]: "" }));
    setConfirmation(false);
  }

  function validateOptions(): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const option of product.options) {
      if (!option.required) continue;
      const selection = selections[option.id];
      if (option.type === "select" || option.type === "color" || option.type === "image") {
        if (!selection?.valueId) errors[option.id] = "Merci de faire un choix.";
      } else if (option.type === "text") {
        if (!selection?.textValue?.trim()) errors[option.id] = "Ce champ est requis.";
      }
    }
    return errors;
  }

  function handleAddToCart() {
    const nextOptionErrors = validateOptions();
    const nextCustomizationErrors = validateCustomization(customization);
    setOptionErrors(nextOptionErrors);
    setCustomizationErrors(nextCustomizationErrors);

    if (Object.values(nextOptionErrors).some(Boolean) || hasCustomizationErrors(nextCustomizationErrors)) {
      setConfirmation(false);
      return;
    }

    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      image: encodeMedalImage(product.shape, product.colors),
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      selectedOptions: resolvedOptions,
      customization: {
        dogName: customization.dogName.trim(),
        phoneNumber: customization.phoneNumber.trim() || undefined,
        customText: customization.customText.trim() || undefined,
      },
      quantity,
      unitPriceCents,
    });
    setConfirmation(true);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{product.name}</h1>
        <p className="mt-2 text-ink-soft">{product.description}</p>
        <p className="mt-4 font-display text-2xl text-clay">{formatPrice(unitPriceCents)}</p>
      </div>

      {product.variants.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">Taille</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setVariantId(variant.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  variant.id === variantId
                    ? "border-clay bg-clay text-white"
                    : "border-border text-ink-soft hover:border-clay hover:text-clay"
                )}
              >
                {variant.name}
                {variant.priceModifierCents > 0 && ` (+${formatPrice(variant.priceModifierCents)})`}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {product.options.map((option) => (
        <fieldset key={option.id}>
          <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
            {option.label}
            {option.required && <span className="text-clay">*</span>}
          </legend>
          {option.description && (
            <p className="mb-2 text-xs text-ink-soft">{option.description}</p>
          )}

          {(option.type === "color") && (
            <div className="flex flex-wrap gap-3">
              {option.values?.map((value) => {
                const active = selections[option.id]?.valueId === value.id;
                return (
                  <button
                    key={value.id}
                    type="button"
                    onClick={() => updateSelection(option.id, { valueId: value.id })}
                    aria-pressed={active}
                    title={`${value.label}${value.priceModifierCents ? ` (+${formatPrice(value.priceModifierCents)})` : ""}`}
                    className={cn(
                      "h-10 w-10 rounded-full border-2 transition-transform",
                      active ? "scale-110 border-clay" : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: value.value }}
                  />
                );
              })}
            </div>
          )}

          {(option.type === "select" || option.type === "image") && (
            <div className="flex flex-wrap gap-2">
              {option.values?.map((value) => {
                const active = selections[option.id]?.valueId === value.id;
                return (
                  <button
                    key={value.id}
                    type="button"
                    onClick={() => updateSelection(option.id, { valueId: value.id })}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-colors",
                      active
                        ? "border-clay bg-clay text-white"
                        : "border-border text-ink-soft hover:border-clay hover:text-clay"
                    )}
                  >
                    {value.label}
                    {Boolean(value.priceModifierCents) && ` (+${formatPrice(value.priceModifierCents!)})`}
                  </button>
                );
              })}
            </div>
          )}

          {option.type === "checkbox" && (
            <label className="flex w-fit cursor-pointer items-center gap-3 rounded-full border border-border px-4 py-2 text-sm text-ink-soft transition-colors hover:border-clay">
              <input
                type="checkbox"
                checked={Boolean(selections[option.id]?.checked)}
                onChange={(e) => updateSelection(option.id, { checked: e.target.checked })}
                className="h-4 w-4 accent-clay"
              />
              Ajouter
              {Boolean(option.priceModifierCents) && ` (+${formatPrice(option.priceModifierCents!)})`}
            </label>
          )}

          {option.type === "text" && (
            <TextInput
              value={selections[option.id]?.textValue ?? ""}
              maxLength={option.maxLength}
              placeholder={option.placeholder}
              onChange={(e) => updateSelection(option.id, { textValue: e.target.value })}
            />
          )}

          {optionErrors[option.id] && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-error">
              {optionErrors[option.id]}
            </p>
          )}
        </fieldset>
      ))}

      <fieldset className="flex flex-col gap-4 rounded-card border border-border/70 bg-paper p-5">
        <legend className="px-1 text-sm font-semibold text-ink">Gravure personnalisée</legend>
        <TextInput
          label="Nom du chien"
          required
          value={customization.dogName}
          maxLength={CUSTOMIZATION_LIMITS.dogName}
          placeholder="Ex. Pépite"
          error={customizationErrors.dogName}
          hint={`${customization.dogName.length}/${CUSTOMIZATION_LIMITS.dogName} caractères`}
          onChange={(e) => {
            setCustomization((c) => ({ ...c, dogName: e.target.value }));
            setCustomizationErrors((err) => ({ ...err, dogName: undefined }));
            setConfirmation(false);
          }}
        />
        <TextInput
          label="Numéro de téléphone (facultatif)"
          type="tel"
          value={customization.phoneNumber}
          maxLength={CUSTOMIZATION_LIMITS.phoneNumber}
          placeholder="Ex. 06 12 34 56 78"
          error={customizationErrors.phoneNumber}
          hint={`${customization.phoneNumber.length}/${CUSTOMIZATION_LIMITS.phoneNumber} caractères`}
          onChange={(e) => {
            setCustomization((c) => ({ ...c, phoneNumber: e.target.value }));
            setCustomizationErrors((err) => ({ ...err, phoneNumber: undefined }));
            setConfirmation(false);
          }}
        />
        <TextInput
          label="Texte personnalisé (facultatif)"
          value={customization.customText}
          maxLength={CUSTOMIZATION_LIMITS.customText}
          placeholder="Ex. Si perdu, appelez-moi !"
          error={customizationErrors.customText}
          hint={`${customization.customText.length}/${CUSTOMIZATION_LIMITS.customText} caractères`}
          onChange={(e) => {
            setCustomization((c) => ({ ...c, customText: e.target.value }));
            setCustomizationErrors((err) => ({ ...err, customText: undefined }));
            setConfirmation(false);
          }}
        />
      </fieldset>

      <div className="rounded-card bg-cream-soft p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">Aperçu de votre médaille</h2>
        <ul className="flex flex-col gap-1.5 text-sm text-ink-soft">
          {selectedVariant && <li>Taille : {selectedVariant.name}</li>}
          {resolvedOptions.map((opt) => (
            <li key={opt.optionId}>
              {opt.optionLabel} : {opt.valueLabel ?? opt.textValue ?? (opt.checked ? "Oui" : "")}
            </li>
          ))}
          <li>Nom du chien : {customization.dogName || "—"}</li>
          {customization.phoneNumber && <li>Téléphone : {customization.phoneNumber}</li>}
          {customization.customText && <li>Texte : {customization.customText}</li>}
        </ul>
      </div>

      <div className="flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Button size="lg" onClick={handleAddToCart}>
            Ajouter au panier — {formatPrice(unitPriceCents * quantity)}
          </Button>
          {confirmation && (
            <p className="text-sm text-success">
              Ajouté au panier ! <Link href="/panier" className="font-medium underline">Voir le panier</Link>
            </p>
          )}
        </div>
      </div>

      <ButtonLink href="/boutique" variant="ghost" size="sm" className="w-fit">
        ← Retour à la boutique
      </ButtonLink>
    </div>
  );
}
