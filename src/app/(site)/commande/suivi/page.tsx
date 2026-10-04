import type { Metadata } from "next";
import { OrderLookupForm } from "@/components/site/order-lookup-form";

export const metadata: Metadata = { title: "Suivre ma commande", robots: { index: false } };

export default function OrderTrackingPage() {
  return (
    <div className="container-site max-w-xl py-12 lg:py-16">
      <h1 className="text-[2.6rem] lg:text-[3.2rem]">Suivre ma commande</h1>
      <p className="mb-8 mt-3 text-brown">
        Indiquez le numéro reçu par email et l’adresse e-mail utilisée lors du paiement.
      </p>
      <OrderLookupForm />
    </div>
  );
}
