import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Panier",
  description: "Votre panier de médailles personnalisées.",
};

export default function CartPage() {
  return <CartView />;
}
