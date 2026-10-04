import Link from "next/link";
import { ArrowRightIcon, NamedIcon } from "@/components/icons";
import { MediaImage } from "@/components/media-image";
import { DoodleHeart, RuledTitle } from "@/components/site/decor";
import { ProductCard } from "@/components/site/product-card";
import { TextLines, safeHref } from "@/components/site/text-lines";
import { isProductAvailable, priceRange } from "@/lib/catalog/map";
import { getFeaturedProducts } from "@/lib/catalog/queries";
import { getSettings, resolveImages } from "@/lib/content/queries";

export default async function HomePage() {
  const [settings, featured] = await Promise.all([getSettings(), getFeaturedProducts()]);
  const home = settings.home;
  const images = await resolveImages([home.hero_image, home.story_image]);
  const hero = images[home.hero_image];
  const story = images[home.story_image];

  const features = [1, 2, 3].map((n) => ({
    icon: home[`feature${n}_icon` as "feature1_icon"],
    title: home[`feature${n}_title` as "feature1_title"],
    text: home[`feature${n}_text` as "feature1_text"],
  }));

  return (
    <>
      {/* Ouverture */}
      <section className="relative overflow-hidden bg-[#efe5da]">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/10] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[64%]">
          <MediaImage media={hero} sizes="(min-width: 1024px) 64vw, 100vw" priority quality={90} />
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(90deg, #efe5da 0%, rgba(239,229,218,0.86) 12%, rgba(239,229,218,0.35) 30%, rgba(239,229,218,0) 46%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 lg:hidden"
            style={{ background: "linear-gradient(0deg, #efe5da 0%, rgba(239,229,218,0) 100%)" }}
            aria-hidden="true"
          />
        </div>
        <div className="container-site relative">
          <div className="flex flex-col justify-center pb-12 pt-2 lg:min-h-[36.5rem] lg:max-w-[33rem] lg:py-16">
            {home.hero_eyebrow ? (
              <>
                <p className="eyebrow">{home.hero_eyebrow}</p>
                <span className="mt-3 block h-px w-16 bg-rose-deco" aria-hidden="true" />
              </>
            ) : null}
            <h1 className="mt-6 max-w-[27rem] text-[2.6rem] leading-[1.02] sm:text-[3.4rem] lg:max-w-[26rem] lg:text-[4.3rem]">
              <TextLines text={home.hero_title} />
              <DoodleHeart className="ml-2 inline-block align-[-0.05em]" size={30} />
            </h1>
            {home.hero_text ? (
              <p className="mt-5 max-w-[26rem] text-[1.125rem] leading-relaxed text-brown lg:text-[1.3rem]">
                <TextLines text={home.hero_text} />
              </p>
            ) : null}
            {home.hero_cta_label ? (
              <div className="mt-8">
                <Link href={safeHref(home.hero_cta_href, "/medailles")} className="btn btn-primary">
                  {home.hero_cta_label}
                  <ArrowRightIcon size={22} />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Coups de cœur */}
      {featured.length > 0 ? (
        <section className="container-site pb-14 pt-10 lg:pb-12 lg:pt-11" aria-labelledby="coups-de-coeur">
          <RuledTitle>
            <span id="coups-de-coeur">{home.featured_title}</span>
          </RuledTitle>
          <div className="mt-7 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6">
            {featured.slice(0, 6).map((product, i) => (
              <ProductCard
                key={product.id}
                variant="home"
                href={`/medailles/${product.slug}`}
                title={product.name}
                priceCents={priceRange(product).min}
                priceFrom={priceRange(product).min !== priceRange(product).max}
                image={product.images[0] ?? null}
                available={isProductAvailable(product)}
                priority={i < 3}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Une médaille à son image */}
      <section className="bg-blush">
        <div className="container-site grid items-center gap-10 py-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2.15fr)] lg:gap-0 lg:py-14">
          <h2 className="text-[2.4rem] leading-[1.02] sm:text-[2.9rem] lg:border-r lg:border-brown/30 lg:pr-10 lg:text-[3.35rem]">
            <TextLines text={home.features_title} />
            <DoodleHeart className="ml-2 inline-block align-[-0.05em]" size={30} />
          </h2>
          <ul className="grid gap-8 sm:grid-cols-3 lg:pl-8">
            {features.map((f, i) => (
              <li key={i} className="flex flex-col items-center text-center">
                <NamedIcon name={f.icon} size={50} strokeWidth={1.1} className="text-ink" />
                <h3 className="mt-3 text-[1.35rem]">{f.title}</h3>
                <p className="mt-1.5 max-w-[14rem] text-[0.98rem] leading-snug text-brown">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Histoire */}
      <section className="grid lg:grid-cols-[58%_42%]">
        <div className="relative aspect-[628/300] min-h-64 w-full lg:aspect-auto lg:min-h-[17.5rem]">
          <MediaImage media={story} sizes="(min-width: 1024px) 58vw, 100vw" />
        </div>
        <div className="container-site flex flex-col justify-center py-10 lg:mx-0 lg:max-w-[38rem] lg:px-14 lg:py-8">
          <h2 className="text-[2rem] leading-[1.08] lg:text-[2.3rem]">
            <TextLines text={home.story_title} />
            <DoodleHeart className="ml-2 inline-block align-[-0.05em]" size={22} />
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-brown">
            <TextLines text={home.story_text} />
          </p>
          {home.story_cta_label ? (
            <div className="mt-6">
              <Link href={safeHref(home.story_cta_href, "/notre-histoire")} className="btn btn-primary !py-3">
                {home.story_cta_label}
                <ArrowRightIcon size={20} />
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
