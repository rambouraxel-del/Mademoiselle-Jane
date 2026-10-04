"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/validation/common";
import { ActionMessage } from "./forms";
import { btnPrimary, btnSecondary } from "./ui";

export type ReorderItem = { id: string; label: string; sublabel?: string; imageUrl?: string | null };

/** Liste réordonnable avec des flèches (utilisable au clavier et au doigt). */
export function ReorderList({
  items: initial,
  onSave,
  saveLabel = "Enregistrer l’ordre",
}: {
  items: ReorderItem[];
  onSave: (ids: string[]) => Promise<ActionResult>;
  saveLabel?: string;
}) {
  const [items, setItems] = useState(initial);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const changed = items.some((it, i) => it.id !== initial[i]?.id);

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setItems(copy);
    setResult(null);
  }

  return (
    <div className="space-y-3">
      <ol className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-center gap-3 p-2.5">
            <span className="w-6 text-center text-sm text-brown-soft">{i + 1}</span>
            {item.imageUrl !== undefined ? (
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-ivory">
                {item.imageUrl ? <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-cover" /> : null}
              </span>
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-ink">{item.label}</span>
              {item.sublabel ? <span className="block text-xs text-brown-soft">{item.sublabel}</span> : null}
            </span>
            <button type="button" className={btnSecondary} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Monter ${item.label}`}>↑</button>
            <button type="button" className={btnSecondary} onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Descendre ${item.label}`}>↓</button>
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={btnPrimary}
          disabled={!changed || pending}
          onClick={() =>
            start(async () => {
              const r = await onSave(items.map((i) => i.id));
              setResult(r);
              if (r.ok) router.refresh();
            })
          }
        >
          {pending ? "Enregistrement…" : saveLabel}
        </button>
        {changed ? <span className="text-sm text-warning">Ordre modifié, non enregistré.</span> : null}
      </div>
      <ActionMessage state={result} />
    </div>
  );
}
