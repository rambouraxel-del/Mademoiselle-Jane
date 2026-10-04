import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, NamedIcon } from "@/components/icons";
import { MediaImage } from "@/components/media-image";
import { HeartSwoosh } from "@/components/site/decor";
import { TextLines, safeHref } from "@/components/site/text-lines";
import { getSettings, resolveImages } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Notre histoire",
  description: "Derrière Mademoizelle Jane, il y a Ophélie, l’amour des chiens et des médailles réalisées à la main.",
  alternates: { canonical: "/notre-histoire" },
};

export default async function StoryPage() {
  const settings = await getSettings();
  const s = settings.story;
  const images = await resolveImages([s.hero_image, s.section_image]);
  const values = [1, 2, 3].map((n) => ({
    icon: s[`value${n}_icon` as "value1_icon"],
    title: s[`value${n}_title` as "value1_title"],
    text: s[`value${n}_text` as "value1_text"],
  }));

  return (
    <>
      <section className="relative overflow-hidden bg-[#f1e8de]">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[58%]">
          <MediaImage media={images[s.hero_image]} sizes="(min-width: 1024px) 58vw, 100vw" priority quality={90} />
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(90deg, #f1e8de 0%, rgba(241,232,222,0.8) 10%, rgba(241,232,222,0.2) 28%, rgba(241,232,222,0) 40%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 lg:hidden"
            style={{ background: "linear-gradient(0deg, #f1e8de 0%, rgba(241,232,222,0) 100%)" }}
            aria-hidden="true"
          />
        </div>
        <div className="container-site relative">
          <div className="pb-12 pt-2 lg:flex lg:min-h-[37.5rem] lg:max-w-[42rem] lg:flex-col lg:justify-center lg:py-14">
            {s.hero_script ? <p className="script text-[2.6rem] text-rose-deco sm:text-[3.2rem]">{s.hero_script}</p> : null}
            <h1 className="mt-4 text-[2.7rem] leading-[1.04] sm:text-[3.6rem] lg:text-[4.4rem]">
              <TextLines text={s.hero_title} />
            </h1>
            {s.hero_text ? (
              <p className="mt-6 max-w-[27rem] text-[1.15rem] leading-relaxed text-brown lg:text-[1.4rem]">
                <TextLines text={s.hero_text} />
              </p>
            ) : null}
            <HeartSwoosh className="mt-6" />
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[48.5%_51.5%]">
        <div className="relative aspect-[525/370] w-full lg:my-4">
          <MediaImage media={images[s.section_image]} sizes="(min-width: 1024px) 48vw, 100vw" />
        </div>
        <div className="container-site flex flex-col justify-center py-10 lg:mx-0 lg:max-w-[42rem] lg:px-16">
          <h2 className="text-[2.2rem] leading-[1.06] sm:text-[2.8rem] lg:text-[3.15rem]">
            <TextLines text={s.section_title} />
          </h2>
          {s.section_text ? (
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-brown lg:text-[1.2rem]">
              <TextLines text={s.section_text} />
            </p>
          ) : null}
          {s.section_text2 ? (
            <>
              <span className="my-6 block h-px w-14 bg-rose-deco" aria-hidden="true" />
              <p className="text-[1.0625rem] leading-relaxed text-brown lg:text-[1.2rem]">
                <TextLines text={s.section_text2} />
              </p>
            </>
          ) : null}
        </div>
      </section>

      <section className="bg-blush">
        <div className="container-site py-12 lg:py-10">
          <ul className="grid gap-10 md:grid-cols-3 md:gap-0">
            {values.map((v, i) => (
              <li
                key={i}
                className={`flex flex-col items-center px-6 text-center ${i > 0 ? "md:border-l md:border-brown/20" : ""}`}
              >
                <NamedIcon name={v.icon} size={60} strokeWidth={1} className="text-ink" />
                <h2 className="mt-3 text-[1.75rem]">{v.title}</h2>
                <p className="mt-2 max-w-[15rem] text-[1rem] leading-snug text-brown">
                  <TextLines text={v.text} />
                </p>
              </li>
            ))}
          </ul>
          {s.cta_label ? (
            <div className="mt-8 flex justify-center">
              <Link href={safeHref(s.cta_href, "/medailles")} className="btn btn-primary btn-pill !px-12 !py-4 !text-[1.2rem] !font-normal">
                {s.cta_label}
                <ArrowRightIcon size={24} />
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
