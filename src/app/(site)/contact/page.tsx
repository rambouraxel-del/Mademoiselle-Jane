import type { Metadata } from "next";
import { ChevronDownIcon, MailIcon } from "@/components/icons";
import { ContactForm } from "@/components/site/contact-form";
import { DoodleHeart } from "@/components/site/decor";
import { TextLines } from "@/components/site/text-lines";
import { getFaq, getSettings } from "@/lib/content/queries";
import { env } from "@/lib/env";
import { createFormToken } from "@/lib/security/request";

export const metadata: Metadata = {
  title: "Contact et questions fréquentes",
  description: "Une question sur une médaille, une personnalisation ou une commande ? Écrivez à Mademoizelle Jane.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [settings, faq] = await Promise.all([getSettings(), getFaq()]);
  const c = settings.contact;
  const email = settings.general.contact_email.trim();

  return (
    <>
      <div className="container-site pt-4 sm:pt-5">
        <section className="relative overflow-hidden bg-blush-soft px-4 pb-6 pt-7 text-center sm:-mx-4 lg:-mx-7 lg:pb-7 lg:pt-8">
          <h1 className="text-[3rem] leading-none sm:text-[3.6rem] lg:text-[4.4rem]">{c.title}</h1>
          <DoodleHeart className="mx-auto mt-3" size={18} />
        </section>
      </div>

      <section className="container-site grid gap-10 py-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:py-14">
        <div>
          <h2 className="text-[2rem] leading-tight lg:text-[2.4rem]">Écrivez-nous</h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-brown">
            <TextLines text={c.intro} />
          </p>
          {c.response_time ? <p className="mt-4 text-brown">Délai de réponse indicatif : {c.response_time}.</p> : null}
          {email ? (
            <p className="mt-6">
              <a href={`mailto:${email}`} className="inline-flex items-center gap-3 text-ink hover:text-rose-text">
                <MailIcon size={22} />
                {email}
              </a>
            </p>
          ) : null}
        </div>
        <div className="rounded-[3px] border border-line bg-[#fffdfa] p-5 shadow-[var(--shadow-soft)] sm:p-8">
          <ContactForm formToken={createFormToken("contact")} turnstileSiteKey={env.turnstileSiteKey} />
        </div>
      </section>

      {faq.length > 0 ? (
        <section id="faq" className="scroll-mt-6 bg-blush" aria-labelledby="faq-title">
          <div className="container-site max-w-4xl py-12 lg:py-14">
            <h2 id="faq-title" className="text-center text-[2.2rem] lg:text-[2.6rem]">
              {c.faq_title}
            </h2>
            <div className="mt-8 border-t border-brown/25">
              {faq.map((item) => (
                <details key={item.id} className="group border-b border-brown/25">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-serif text-[1.3rem] text-ink hover:text-rose-text [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDownIcon size={20} className="shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pb-5 text-[1rem] leading-relaxed text-brown">
                    <TextLines text={item.answer} />
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
