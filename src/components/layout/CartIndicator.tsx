"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function CartIndicator() {
  const { summary } = useCart();

  return (
    <Link
      href="/panier"
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream-soft"
      aria-label={`Panier, ${summary.itemCount} article${summary.itemCount > 1 ? "s" : ""}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M6 8h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {summary.itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 text-[11px] font-semibold text-white">
          {summary.itemCount}
        </span>
      )}
    </Link>
  );
}
