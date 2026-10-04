"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { clearCart } from "./cart-store";

/**
 * Sur la page de confirmation : vide le panier une fois le paiement confirmé
 * (par le webhook Stripe), sinon recharge l'état quelques fois.
 */
export function OrderStatusWatcher({ paid, waiting }: { paid: boolean; waiting: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (paid) clearCart();
  }, [paid]);
  useEffect(() => {
    if (!waiting) return;
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      router.refresh();
      if (count >= 20) window.clearInterval(timer);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [waiting, router]);
  return null;
}
