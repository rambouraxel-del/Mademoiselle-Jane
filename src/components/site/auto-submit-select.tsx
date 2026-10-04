"use client";

import { ChevronDownIcon } from "@/components/icons";

/** Liste déroulante qui applique le filtre dès qu'on change de valeur (bouton de secours sans JavaScript). */
export function AutoSubmitSelect({
  name,
  label,
  defaultValue,
  options,
  className = "",
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={`relative inline-flex ${className}`}>
      <span className="visually-hidden">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-10 w-full appearance-none rounded-full border border-line-strong bg-transparent py-1 pl-4 pr-9 text-[0.875rem] text-ink sm:pl-5 sm:pr-10 sm:text-[0.9375rem] hover:border-rose focus:border-rose focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon size={18} className="pointer-events-none absolute right-3 top-1/2 sm:right-4 -translate-y-1/2 text-ink" />
    </label>
  );
}
