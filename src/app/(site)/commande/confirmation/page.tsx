import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatusWatcher } from "@/components/cart/order-status-watcher";
import { DoodleHeart } from "@/components/site/decor";
import { OrderSummary } from "@/components/site/order-summary";
import { FULFILLMENT_LABELS } from "@/lib/orders/labels";
import { getOrderByToken } from "@/lib/orders/public";

export const metadata: Metadata = { title: "Votre commande", robots: { index: false, follow: false } };

export default async function ConfirmationPage({ searchParams }: PageProps<"/commande/confirmation">) {
  const sp = await searchParams;
  const token = typeof sp.ref === "string" ? sp.ref : "";
  const order = await getOrderByToken(token);

  if (!order) {
    return (
      <div className="container-site max-w-2xl py-16 text-center">
        <h1 className="text-[2.6rem]">Commande introuvable</h1>
        <p className="mt-4">Ce lien n’est pas valide. Si vous avez payé, vous recevrez un email de confirmation.</p>
        <Link href="/" className="btn btn-primary mt-6">
          Retour à l’accueil
        </Link>
      </div>
    );
  }

  // Seul un événement Stripe signé (webhook) fait passer la commande à « payée ».
  const paid = order.paymentStatus === "paid";
  const waiting = order.paymentStatus === "pending" || order.paymentStatus === "processing";

  return (
    <div className="container-site max-w-3xl py-12 lg:py-16">
      <OrderStatusWatcher paid={paid} waiting={waiting} />
      <div className="text-center">
        <DoodleHeart className="mx-auto" size={30} />
        {paid ? (
          <>
            <h1 className="mt-3 text-[2.6rem] lg:text-[3.2rem]">
              Merci{order.firstName ? ` ${order.firstName}` : ""} !
            </h1>
            <p className="mt-3 text-[1.1rem]">
              Votre commande <strong className="text-ink">{order.orderNumber}</strong> est confirmée. Un email
              récapitulatif vous a été envoyé.
            </p>
            <p className="mt-2 text-brown-soft">État : {FULFILLMENT_LABELS[order.fulfillmentStatus]}</p>
          </>
        ) : waiting ? (
          <>
            <h1 className="mt-3 text-[2.4rem] lg:text-[3rem]">Paiement en cours de confirmation…</h1>
            <p className="mt-3 text-[1.05rem]" role="status">
              Nous attendons la confirmation de Stripe pour la commande <strong>{order.orderNumber}</strong>. Cette page
              se met à jour automatiquement. Si vous avez choisi un moyen de paiement différé, la confirmation peut
              prendre plus de temps : vous recevrez un email.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-[2.4rem] lg:text-[3rem]">Paiement non abouti</h1>
            <p className="mt-3 text-[1.05rem]">
              La commande <strong>{order.orderNumber}</strong> n’a pas été payée. Aucun montant n’a été encaissé. Votre
              panier est conservé : vous pouvez réessayer.
            </p>
            <Link href="/panier" className="btn btn-primary mt-6">
              Retour au panier
            </Link>
          </>
        )}
      </div>
      <div className="mt-10">
        <OrderSummary order={order} />
      </div>
      {paid && order.trackingNumber ? (
        <p className="mt-6 text-center">
          Suivi du colis : {order.carrier ? `${order.carrier} — ` : ""}
          {order.trackingUrl && /^https:\/\//.test(order.trackingUrl) ? (
            <a href={order.trackingUrl} className="text-rose-text underline" rel="noopener noreferrer" target="_blank">
              {order.trackingNumber}
            </a>
          ) : (
            order.trackingNumber
          )}
        </p>
      ) : null}
      <p className="mt-8 text-center">
        <Link href="/medailles" className="text-rose-text underline underline-offset-2">
          Continuer la visite
        </Link>
      </p>
    </div>
  );
}
