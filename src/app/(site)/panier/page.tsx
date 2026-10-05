import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { getShippingZones } from "@/lib/content/queries";
import { isPreviewMode, isStripeConfigured, paymentMode } from "@/lib/env";

export const metadata: Metadata = {
  title: "Panier",
  robots: { index: false },
};

export default async function CartPage() {
  const zones = await getShippingZones();
  const countries = [...new Set(zones.flatMap((z) => z.countries))];
  return (
    <div className="container-site py-10 lg:py-14">
      <h1 className="mb-8 text-[2.8rem] lg:text-[3.4rem]">Votre panier</h1>
      <CartView
        countries={countries}
        paymentEnabled={isStripeConfigured()}
        testMode={paymentMode() === "test"}
        previewMode={isPreviewMode()}
      />
    </div>
  );
}
