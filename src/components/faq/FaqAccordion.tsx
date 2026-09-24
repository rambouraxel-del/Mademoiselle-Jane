"use client";

import { useState } from "react";
import type { FaqItem } from "@/data/faq";
import { cn } from "@/utils/cn";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="flex flex-col divide-y divide-border/70 rounded-card border border-border/70 bg-paper">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open}
            >
              <span className="font-medium text-ink">{item.question}</span>
              <span
                className={cn(
                  "shrink-0 text-lg text-clay transition-transform duration-200",
                  open && "rotate-45"
                )}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              className={cn(
                "grid overflow-hidden px-5 text-sm text-ink-soft transition-all duration-200",
                open ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <p className="min-h-0">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
