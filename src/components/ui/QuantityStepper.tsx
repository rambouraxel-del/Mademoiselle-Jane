"use client";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  ariaLabel = "Quantité",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-paper">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuer la quantité"
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-ink-soft transition-colors hover:text-clay disabled:opacity-30"
      >
        −
      </button>
      <span aria-label={ariaLabel} className="w-8 text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Augmenter la quantité"
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-ink-soft transition-colors hover:text-clay disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
