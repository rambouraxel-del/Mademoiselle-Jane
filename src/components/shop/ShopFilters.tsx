import Link from "next/link";
import { colorSwatches } from "@/data/colorSwatches";
import { cn } from "@/utils/cn";
import type { ProductRange, ProductShape } from "@/types";

export interface ShopSearchParams {
  shape?: string;
  color?: string;
  range?: string;
  price?: string;
}

const shapeOptions: { value: ProductShape; label: string }[] = [
  { value: "ronde", label: "Ronde" },
  { value: "coeur", label: "Cœur" },
  { value: "os", label: "Os" },
  { value: "patte", label: "Patte" },
];

const rangeOptions: { value: ProductRange; label: string }[] = [
  { value: "essentielle", label: "Essentielle" },
  { value: "signature", label: "Signature" },
  { value: "premium", label: "Premium" },
];

const priceOptions: { value: string; label: string }[] = [
  { value: "30", label: "Jusqu'à 30 €" },
  { value: "35", label: "Jusqu'à 35 €" },
  { value: "40", label: "Jusqu'à 40 €" },
];

function buildHref(current: ShopSearchParams, key: keyof ShopSearchParams, value: string) {
  const next: ShopSearchParams = { ...current };
  if (next[key] === value) {
    delete next[key];
  } else {
    next[key] = value;
  }
  const query = new URLSearchParams(
    Object.entries(next).filter(([, v]) => Boolean(v)) as [string, string][]
  ).toString();
  return query ? `/boutique?${query}` : "/boutique";
}

function FilterPill({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-clay bg-clay text-white"
          : "border-border text-ink-soft hover:border-clay hover:text-clay"
      )}
    >
      {children}
    </Link>
  );
}

export function ShopFilters({ searchParams }: { searchParams: ShopSearchParams }) {
  const hasFilters = Boolean(
    searchParams.shape || searchParams.color || searchParams.range || searchParams.price
  );

  return (
    <div className="flex flex-col gap-5 rounded-card border border-border/70 bg-paper p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Filtrer les médailles</h2>
        {hasFilters && (
          <Link href="/boutique" className="text-xs font-medium text-clay hover:underline">
            Réinitialiser
          </Link>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Forme</p>
        <div className="flex flex-wrap gap-2">
          {shapeOptions.map((option) => (
            <FilterPill
              key={option.value}
              active={searchParams.shape === option.value}
              href={buildHref(searchParams, "shape", option.value)}
            >
              {option.label}
            </FilterPill>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Couleur</p>
        <div className="flex flex-wrap gap-2">
          {colorSwatches.map((swatch) => {
            const active = searchParams.color === swatch.id;
            return (
              <Link
                key={swatch.id}
                href={buildHref(searchParams, "color", swatch.id)}
                aria-label={swatch.label}
                aria-pressed={active}
                title={swatch.label}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-transform",
                  active ? "scale-110 border-clay" : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: swatch.hex }}
              />
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Gamme</p>
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((option) => (
            <FilterPill
              key={option.value}
              active={searchParams.range === option.value}
              href={buildHref(searchParams, "range", option.value)}
            >
              {option.label}
            </FilterPill>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Prix</p>
        <div className="flex flex-wrap gap-2">
          {priceOptions.map((option) => (
            <FilterPill
              key={option.value}
              active={searchParams.price === option.value}
              href={buildHref(searchParams, "price", option.value)}
            >
              {option.label}
            </FilterPill>
          ))}
        </div>
      </div>
    </div>
  );
}
