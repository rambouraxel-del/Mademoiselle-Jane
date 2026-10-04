import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText, missingTokens } from "@/components/rich-text";
import { getInfoPage, getSettings, getShippingZones } from "@/lib/content/queries";
import { countryName, formatPrice } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/infos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getInfoPage(slug);
  if (!page) return { title: "Page introuvable" };
  return {
    title: page.title,
    description: page.seoDescription || undefined,
    alternates: { canonical: `/infos/${page.slug}` },
  };
}

export default async function InfoPage({ params }: PageProps<"/infos/[slug]">) {
  const { slug } = await params;
  const page = await getInfoPage(slug);
  if (!page) notFound();
  const [settings, zones] = await Promise.all([getSettings(), getShippingZones()]);
  const tokens = { ...settings.commerce, contact_email: settings.general.contact_email } as Record<string, string>;
  const missing = missingTokens(page.body, tokens);
  const incomplete = !page.isComplete || missing.length > 0;

  return (
    <article className="container-site max-w-3xl py-12 lg:py-16">
      <h1 className="text-[2.6rem] leading-tight lg:text-[3.2rem]">{page.title}</h1>
      {incomplete ? (
        <div role="note" className="mt-6 rounded-[3px] border border-warning/30 bg-warning-bg px-4 py-3 text-[0.95rem] text-warning">
          <strong>Page en cours de rédaction.</strong> Certaines informations sont encore à compléter et seront précisées
          prochainement.
        </div>
      ) : null}
      <div className="mt-8 text-[1.0625rem] leading-relaxed">
        <RichText
          source={page.body}
          tokens={tokens}
          blocks={{
            shipping_zones: () =>
              zones.length === 0 ? (
                <p>
                  <mark className="rounded bg-warning-bg px-1 text-warning">[Zones de livraison : à compléter]</mark>
                </p>
              ) : (
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[28rem] border-collapse text-left text-[0.98rem]">
                    <thead>
                      <tr className="border-b border-line-strong">
                        <th scope="col" className="py-2 pr-4 font-medium text-ink">Zone</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink">Pays</th>
                        <th scope="col" className="py-2 pr-4 font-medium text-ink">Frais</th>
                        <th scope="col" className="py-2 font-medium text-ink">Délai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zones.map((z) => (
                        <tr key={z.id} className="border-b border-line">
                          <td className="py-2 pr-4">{z.name}</td>
                          <td className="py-2 pr-4">{z.countries.map(countryName).join(", ")}</td>
                          <td className="py-2 pr-4">
                            {z.priceCents === 0 ? "Offerts" : formatPrice(z.priceCents)}
                            {z.freeFromCents !== null ? ` (offerts dès ${formatPrice(z.freeFromCents)})` : ""}
                          </td>
                          <td className="py-2">{z.delayText || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ),
          }}
        />
      </div>
    </article>
  );
}
