import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { AutoSubmitSelect } from "@/components/site/auto-submit-select";
import { DoodleHeart, LoopHeart } from "@/components/site/decor";
import { ProductCard } from "@/components/site/product-card";
import { TextLines } from "@/components/site/text-lines";
import { SORT_OPTIONS, applyFilters, filterOptions, normalize, parseFilters } from "@/lib/catalog/filters";
import { getPublishedCollections, getPublishedProducts } from "@/lib/catalog/queries";
import { getSettings } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Les médailles",
  description:
    "Médailles pour chiens personnalisées : cœur rond, fleur d’amour, cœur ovale, en finition dorée ou argentée.",
  alternates: { canonical: "/medailles" },
};

function hrefWith(current: Record<string, string>, changes: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...current, ...changes })) if (v) params.set(k, v);
  const qs = params.toString();
  return qs ? `/medailles?${qs}` : "/medailles";
}

export default async function ShopPage({ searchParams }: PageProps<"/medailles">) {
  const filters = parseFilters(await searchParams);
  const [settings, products, collections] = await Promise.all([
    getSettings(),
    getPublishedProducts(),
    getPublishedCollections(),
  ]);
  const shop = settings.shop;
  const { shapes, finishes } = filterOptions(products);
  const cards = applyFilters(products, filters);
  const current = { ...filters } as Record<string, string>;
  const activeShape = normalize(filters.forme);

  return (
    <>
      <div className="container-site pt-4 sm:pt-5">
        <section className="relative overflow-hidden bg-blush-soft px-4 pb-6 pt-7 text-center sm:-mx-4 lg:-mx-7 lg:pb-7 lg:pt-8">
          <h1 className="text-[3rem] leading-none sm:text-[3.6rem] lg:text-[4.4rem]">{shop.title}</h1>
          {shop.subtitle ? (
            <p className="mt-3 text-[1.05rem] tracking-[0.14em] text-ink sm:text-[1.3rem]">{shop.subtitle}</p>
          ) : null}
          <DoodleHeart className="mx-auto mt-2" size={18} />
          <div className="pointer-events-none absolute right-[5%] top-[22%] hidden md:block" aria-hidden="true">
            <DoodleHeart size={22} className="-rotate-12" />
            <DoodleHeart size={40} className="ml-5 rotate-6" />
          </div>
        </section>
      </div>

      <section className="container-site pb-14 pt-5" aria-label="Catalogue">
        <form method="get" action="/medailles" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Filtrer par forme">
            <ul className="flex flex-wrap gap-2 sm:gap-3">
              <li>
                <Link
                  href={hrefWith(current, { forme: "" })}
                  className="chip"
                  aria-current={!activeShape ? "true" : undefined}
                >
                  Toutes
                </Link>
              </li>
              {shapes.map((s) => (
                <li key={s.value}>
                  <Link
                    href={hrefWith(current, { forme: s.value })}
                    className="chip"
                    aria-current={activeShape === s.value ? "true" : undefined}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {filters.forme ? <input type="hidden" name="forme" value={filters.forme} /> : null}
          <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <label className="relative col-span-2 flex h-10 min-w-0 items-center sm:col-span-1 sm:flex-none">
              <span className="visually-hidden">Rechercher</span>
              <SearchIcon size={18} className="pointer-events-none absolute left-4 text-brown-soft" />
              <input
                type="search"
                name="q"
                defaultValue={filters.q}
                maxLength={80}
                placeholder="Rechercher"
                className="h-10 w-full rounded-full border border-line-strong bg-transparent pl-10 pr-4 text-[0.9375rem] text-ink placeholder:text-brown-soft/80 focus:border-rose focus:outline-none sm:w-44"
              />
            </label>
            {collections.length > 0 ? (
              <AutoSubmitSelect
                name="collection"
                label="Collection"
                defaultValue={filters.collection}
                options={[{ value: "", label: "Toutes les collections" }, ...collections.map((c) => ({ value: c.slug, label: c.name }))]}
              />
            ) : null}
            <AutoSubmitSelect
              name="finition"
              label="Finition"
              defaultValue={filters.finition}
              options={[{ value: "", label: "Toutes les finitions" }, ...finishes]}
            />
            <AutoSubmitSelect
              name="tri"
              label="Trier par"
              defaultValue={filters.tri}
              options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.value ? o.label : "Trier par" }))}
            />
            <noscript>
              <button type="submit" className="chip">
                Appliquer
              </button>
            </noscript>
          </div>
        </form>

        {filters.q ? (
          <p className="mt-5 text-sm text-brown-soft" role="status">
            {cards.length} résultat{cards.length > 1 ? "s" : ""} pour « {filters.q} » —{" "}
            <Link href={hrefWith(current, { q: "" })} className="underline underline-offset-2 hover:text-rose-text">
              effacer la recherche
            </Link>
          </p>
        ) : null}

        {cards.length > 0 ? (
          <ul className="mt-5 grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-6">
            {cards.map((card, i) => (
              <li key={card.key}>
                <ProductCard
                  href={card.href}
                  title={card.title}
                  priceCents={card.priceCents}
                  image={card.image}
                  available={card.available}
                  personalizable={card.product.personalization.name.enabled}
                  priority={i < 3}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded border border-dashed border-line-strong px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">Aucune médaille ne correspond à votre recherche.</p>
            <Link href="/medailles" className="btn btn-primary mt-6">
              Voir toutes les médailles
            </Link>
          </div>
        )}
      </section>

      {shop.quote_enabled && shop.quote ? (
        <section className="bg-beige-soft">
          <div className="container-site grid items-center gap-6 py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] md:py-12">
            <div className="hidden justify-center md:flex md:border-r md:border-brown/25 md:pr-8">
              <LoopHeart className="h-auto w-full max-w-[19rem]" />
            </div>
            <p className="text-center font-serif text-[2rem] leading-[1.12] text-ink sm:text-[2.6rem] lg:text-[3.15rem]">
              <TextLines text={shop.quote} />
              <DoodleHeart className="ml-2 inline-block align-[-0.05em]" size={26} />
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
