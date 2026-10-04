import { formatPrice } from "@/lib/format";

/** Échappement HTML de toute donnée insérée dans un email. */
export function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const C = { ivory: "#f9f5ef", ink: "#3b2a25", brown: "#514139", rose: "#a5656a", blush: "#efd8d3", line: "#e2d6cb" };

function layout(title: string, body: string, siteUrl: string): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:${C.ivory};color:${C.brown};font-family:Georgia,'Times New Roman',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ivory};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fffdfa;border:1px solid ${C.line};">
<tr><td style="background:${C.blush};padding:18px 24px;text-align:center;font-size:22px;color:${C.ink};font-style:italic;">Mademoizelle Jane</td></tr>
<tr><td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${C.brown};">${body}</td></tr>
<tr><td style="padding:16px 28px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7a6c64;border-top:1px solid ${C.line};">
<a href="${escapeHtml(siteUrl)}" style="color:${C.rose};">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a></td></tr>
</table></td></tr></table></body></html>`;
}

export type EmailOrder = {
  orderNumber: string;
  customerName: string | null;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingZoneName: string;
  shippingAddress: Record<string, string | null> | null;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  publicToken: string;
  items: {
    productName: string;
    variantName: string;
    quantity: number;
    lineTotalCents: number;
    personalization: { name?: string; phone?: string };
  }[];
};

function itemsTable(order: EmailOrder): string {
  const rows = order.items
    .map((i) => {
      const perso = [
        i.personalization.name ? `Prénom : <strong>${escapeHtml(i.personalization.name)}</strong>` : "",
        i.personalization.phone ? `Téléphone au dos : ${escapeHtml(i.personalization.phone)}` : "",
      ]
        .filter(Boolean)
        .join("<br>");
      return `<tr><td style="padding:10px 0;border-bottom:1px solid ${C.line};">${escapeHtml(i.productName)}${
        i.variantName ? ` — ${escapeHtml(i.variantName)}` : ""
      } × ${i.quantity}${perso ? `<br><span style="font-size:13px;color:#6b5d55;">${perso}</span>` : ""}</td>
<td style="padding:10px 0;border-bottom:1px solid ${C.line};text-align:right;white-space:nowrap;">${formatPrice(i.lineTotalCents)}</td></tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">${rows}
<tr><td style="padding:8px 0;">Sous-total</td><td style="text-align:right;">${formatPrice(order.subtotalCents)}</td></tr>
<tr><td style="padding:4px 0;">Livraison (${escapeHtml(order.shippingZoneName)})</td><td style="text-align:right;">${formatPrice(order.shippingCents)}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:${C.ink};">Total payé</td><td style="text-align:right;font-weight:bold;color:${C.ink};">${formatPrice(order.totalCents)}</td></tr></table>`;
}

function addressBlock(address: EmailOrder["shippingAddress"], name: string | null): string {
  if (!address) return "";
  const lines = [name, address.line1, address.line2, `${address.postal_code ?? ""} ${address.city ?? ""}`.trim(), address.country]
    .filter((l) => l && l.trim() !== "")
    .map((l) => escapeHtml(l));
  return `<p style="margin:16px 0 0;"><strong>Adresse de livraison</strong><br>${lines.join("<br>")}</p>`;
}

function textItems(order: EmailOrder): string {
  return order.items
    .map(
      (i) =>
        `- ${i.productName}${i.variantName ? ` — ${i.variantName}` : ""} × ${i.quantity} : ${formatPrice(i.lineTotalCents)}` +
        (i.personalization.name ? `\n  Prénom : ${i.personalization.name}` : "") +
        (i.personalization.phone ? `\n  Téléphone au dos : ${i.personalization.phone}` : ""),
    )
    .join("\n");
}

export function orderConfirmationEmail(order: EmailOrder, siteUrl: string) {
  const link = `${siteUrl}/commande/confirmation?ref=${encodeURIComponent(order.publicToken)}`;
  const hello = order.customerName ? `Bonjour ${escapeHtml(order.customerName.split(" ")[0])},` : "Bonjour,";
  const html = layout(
    `Commande ${order.orderNumber}`,
    `<p>${hello}</p><p>Merci pour votre commande <strong>${escapeHtml(order.orderNumber)}</strong> ! Votre paiement est bien confirmé. Ophélie va maintenant réaliser votre médaille à la main.</p>
${itemsTable(order)}${addressBlock(order.shippingAddress, order.customerName)}
<p style="margin-top:20px;">Vous recevrez un email lors de l’expédition. Vous pouvez suivre votre commande ici : <a href="${escapeHtml(link)}" style="color:${C.rose};">voir ma commande</a>.</p>
<p>À très vite,<br>Mademoizelle Jane</p>`,
    siteUrl,
  );
  const text = `${order.customerName ? `Bonjour ${order.customerName.split(" ")[0]},` : "Bonjour,"}

Merci pour votre commande ${order.orderNumber} ! Votre paiement est bien confirmé.

${textItems(order)}

Sous-total : ${formatPrice(order.subtotalCents)}
Livraison : ${formatPrice(order.shippingCents)}
Total payé : ${formatPrice(order.totalCents)}

Suivre votre commande : ${link}

Mademoizelle Jane`;
  return { subject: `Votre commande ${order.orderNumber} est confirmée`, html, text };
}

export function shopNewOrderEmail(order: EmailOrder, siteUrl: string, orderId: string) {
  const link = `${siteUrl}/admin/commandes/${orderId}`;
  const html = layout(
    `Nouvelle commande ${order.orderNumber}`,
    `<p>Nouvelle commande payée : <strong>${escapeHtml(order.orderNumber)}</strong> (${formatPrice(order.totalCents)}).</p>
${itemsTable(order)}<p><a href="${escapeHtml(link)}" style="color:${C.rose};">Ouvrir la commande dans l’administration</a></p>`,
    siteUrl,
  );
  const text = `Nouvelle commande payée : ${order.orderNumber} (${formatPrice(order.totalCents)})\n\n${textItems(order)}\n\n${link}`;
  return { subject: `Nouvelle commande ${order.orderNumber}`, html, text };
}

export function shippingEmail(order: EmailOrder, siteUrl: string) {
  const hello = order.customerName ? `Bonjour ${escapeHtml(order.customerName.split(" ")[0])},` : "Bonjour,";
  const tracking = order.trackingNumber
    ? `<p>${order.carrier ? `Transporteur : ${escapeHtml(order.carrier)}<br>` : ""}Numéro de suivi : <strong>${escapeHtml(order.trackingNumber)}</strong>${
        order.trackingUrl && /^https?:\/\//.test(order.trackingUrl)
          ? `<br><a href="${escapeHtml(order.trackingUrl)}" style="color:${C.rose};">Suivre le colis</a>`
          : ""
      }</p>`
    : "";
  const html = layout(
    `Commande ${order.orderNumber} expédiée`,
    `<p>${hello}</p><p>Bonne nouvelle : votre commande <strong>${escapeHtml(order.orderNumber)}</strong> vient d’être expédiée !</p>${tracking}
${addressBlock(order.shippingAddress, order.customerName)}<p style="margin-top:20px;">Merci pour votre confiance,<br>Mademoizelle Jane</p>`,
    siteUrl,
  );
  const text = `Votre commande ${order.orderNumber} vient d'être expédiée.${
    order.trackingNumber ? `\nNuméro de suivi : ${order.trackingNumber}` : ""
  }${order.trackingUrl ? `\nSuivi : ${order.trackingUrl}` : ""}\n\nMademoizelle Jane`;
  return { subject: `Votre commande ${order.orderNumber} est en route`, html, text };
}

export function contactNotificationEmail(
  msg: { name: string; email: string; subject: string; message: string; orderNumber: string },
  siteUrl: string,
) {
  const html = layout(
    "Nouveau message",
    `<p><strong>${escapeHtml(msg.name)}</strong> (${escapeHtml(msg.email)}) vous a écrit${
      msg.subject ? ` : « ${escapeHtml(msg.subject)} »` : ""
    }.</p>${msg.orderNumber ? `<p>Commande : ${escapeHtml(msg.orderNumber)}</p>` : ""}
<p style="white-space:pre-wrap;border-left:3px solid ${C.blush};padding-left:12px;">${escapeHtml(msg.message)}</p>
<p><a href="${escapeHtml(siteUrl)}/admin/messages" style="color:${C.rose};">Voir les messages</a></p>`,
    siteUrl,
  );
  const text = `Message de ${msg.name} (${msg.email})\n${msg.subject}\n${msg.orderNumber}\n\n${msg.message}`;
  return { subject: `Nouveau message : ${msg.subject || msg.name}`.slice(0, 150), html, text };
}

export function newsletterConfirmEmail(confirmUrl: string, unsubscribeUrl: string, siteUrl: string) {
  const html = layout(
    "Confirmez votre inscription",
    `<p>Bonjour,</p><p>Pour recevoir les nouveautés de Mademoizelle Jane, merci de confirmer votre inscription :</p>
<p style="text-align:center;margin:24px 0;"><a href="${escapeHtml(confirmUrl)}" style="background:${C.rose};color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;">Je confirme mon inscription</a></p>
<p style="font-size:13px;">Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet email : vous ne serez pas inscrit·e. Désinscription à tout moment : <a href="${escapeHtml(unsubscribeUrl)}" style="color:${C.rose};">se désinscrire</a>.</p>`,
    siteUrl,
  );
  const text = `Confirmez votre inscription à la newsletter Mademoizelle Jane : ${confirmUrl}\n\nDésinscription : ${unsubscribeUrl}`;
  return { subject: "Confirmez votre inscription — Mademoizelle Jane", html, text };
}
