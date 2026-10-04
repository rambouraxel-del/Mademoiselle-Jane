"use client";

import { useSyncExternalStore } from "react";
import {
  MAX_CART_LINES,
  MAX_QUANTITY_PER_LINE,
  lineKey,
  normalizePersonalization,
  type CartLine,
} from "@/lib/cart/types";

/**
 * Panier du visiteur, conservé dans son navigateur (localStorage).
 * Il ne contient que des références et la personnalisation : le catalogue
 * et les prix font toujours foi depuis la base de données.
 */
const STORAGE_KEY = "mj-cart-v1";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let snapshot: CartLine[] | null = null;

function read(): CartLine[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartLine[]).filter((l) => l && typeof l.key === "string") : EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(lines: CartLine[]) {
  snapshot = lines;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Stockage indisponible (navigation privée) : le panier reste en mémoire.
  }
  listeners.forEach((l) => l());
}

function getSnapshot(): CartLine[] {
  if (snapshot === null) snapshot = read();
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      snapshot = read();
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function useCartCount(): number {
  return useCart().reduce((sum, l) => sum + l.quantity, 0);
}

export function addToCart(line: Omit<CartLine, "key">): void {
  const personalization = normalizePersonalization(line.personalization);
  const key = lineKey(line.productId, line.variantId, personalization);
  const lines = [...getSnapshot()];
  const existing = lines.findIndex((l) => l.key === key);
  if (existing >= 0) {
    const current = lines[existing];
    lines[existing] = {
      ...current,
      display: line.display,
      quantity: Math.min(MAX_QUANTITY_PER_LINE, current.quantity + line.quantity),
    };
  } else {
    if (lines.length >= MAX_CART_LINES) throw new Error("Le panier est plein.");
    lines.push({ ...line, personalization, key, quantity: Math.min(MAX_QUANTITY_PER_LINE, line.quantity) });
  }
  write(lines);
}

export function setQuantity(key: string, quantity: number): void {
  const q = Math.max(1, Math.min(MAX_QUANTITY_PER_LINE, Math.round(quantity)));
  write(getSnapshot().map((l) => (l.key === key ? { ...l, quantity: q } : l)));
}

export function removeLine(key: string): void {
  write(getSnapshot().filter((l) => l.key !== key));
}

export function replaceLines(lines: CartLine[]): void {
  write(lines);
}

export function clearCart(): void {
  write([]);
}
