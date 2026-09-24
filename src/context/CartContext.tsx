"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { CartItem, CartSummary } from "@/types";
import { generateId } from "@/utils/id";

const STORAGE_KEY = "mademoiselle-jane:cart";
/** Placeholder — sera remplacé par un calcul réel (transporteur / poids) au lot suivant. */
const FREE_SHIPPING_THRESHOLD_CENTS = 6000;
const SHIPPING_FLAT_RATE_CENTS = 490;

type CartState = {
  items: CartItem[];
  hydrated: boolean;
};

type CartAction =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "UPDATE_QUANTITY"; itemId: string; quantity: number }
  | { type: "REMOVE_ITEM"; itemId: string }
  | { type: "CLEAR_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items, hydrated: true };
    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.item] };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.itemId
            ? {
                ...item,
                quantity: action.quantity,
                lineTotalCents: item.unitPriceCents * action.quantity,
              }
            : item
        ),
      };
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((item) => item.id !== action.itemId) };
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  summary: CartSummary;
  addItem: (item: Omit<CartItem, "id" | "lineTotalCents">) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], hydrated: false });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const items: CartItem[] = raw ? JSON.parse(raw) : [];
      dispatch({ type: "HYDRATE", items });
    } catch {
      dispatch({ type: "HYDRATE", items: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Stockage indisponible (mode privé, quota) : on ignore silencieusement.
    }
  }, [state.items, state.hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "id" | "lineTotalCents">) => {
    const cartItem: CartItem = {
      ...item,
      id: generateId("cart-item"),
      lineTotalCents: item.unitPriceCents * item.quantity,
    };
    dispatch({ type: "ADD_ITEM", item: cartItem });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch({ type: "UPDATE_QUANTITY", itemId, quantity });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", itemId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const summary = useMemo<CartSummary>(() => {
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalCents = state.items.reduce((sum, item) => sum + item.lineTotalCents, 0);
    const shippingEstimateCents =
      subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
        ? 0
        : SHIPPING_FLAT_RATE_CENTS;
    return {
      itemCount,
      subtotalCents,
      shippingEstimateCents,
      totalCents: subtotalCents + shippingEstimateCents,
    };
  }, [state.items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      hydrated: state.hydrated,
      summary,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [state.items, state.hydrated, summary, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé à l'intérieur de <CartProvider>.");
  }
  return context;
}
