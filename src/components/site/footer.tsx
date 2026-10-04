import Link from "next/link";
import type { AllSettings } from "@/lib/content/sections";
import { FacebookIcon, InstagramIcon, MailIcon, PinterestIcon } from "@/components/icons";
import { NewsletterForm } from "./newsletter-form";
import { NAV_LINKS } from "./nav-links";

const INFO_LINKS = [
  { href: "/infos/livraison", label: "Livraison" },
  { href: "/infos/entretien", label: "Entretien" },
  { href: "/contact#faq", label: "FAQ" },
  { href: "/infos/cgv", label: "CGV" },
  { href: "/infos/mentions-legales", label: "Mentions légales" },
  { href: "/infos/confidentialite", label: "Confidentialité" },
];

function safeUrl(url: string): string | null {
  return /^https:\/\/[^\s]+$/i.test(url) ? url : null;
}

export function Footer({ settings, logo }: { settings: AllSettings; logo: React.ReactNode }) {
  const g = settings.general;
  const socials = [
    { url: safeUrl(g.instagram_url), label: "Instagram", Icon: InstagramIcon },
    { url: safeUrl(g.pinterest_url), label: "Pinterest", Icon: PinterestIcon },
    { url: safeUrl(g.facebook_url), label: "Facebook", Icon: FacebookIcon },
  ].filter((s) => s.url);
  const email = g.contact_email.trim();

  return (
    <footer className="mt-auto border-t border-line bg-ivory">
      <div className="container-site grid gap-10 py-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.6fr)_auto] md:gap-0 md:py-8">
        <div className="md:pr-8">
          <Link href="/" className="block w-56 max-w-full lg:w-64" aria-label="Mademoizelle Jane — accueil">
            {logo}
          </Link>
          {g.footer_tagline ? <p className="mt-3 max-w-xs text-sm text-brown">{g.footer_tagline}</p> : null}
        </div>

        <nav aria-label="Pied de page" className="md:border-l md:border-line md:px-8">
          <ul className="space-y-1.5 text-[0.9375rem]">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink hover:text-rose-text">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:border-l md:border-line md:px-8">
          {g.newsletter_enabled ? (
            <>
              <h2 className="font-serif text-xl text-ink">{g.newsletter_title}</h2>
              {g.newsletter_text ? <p className="mb-3 mt-1 text-sm text-brown-soft">{g.newsletter_text}</p> : <div className="mb-3" />}
              <NewsletterForm />
            </>
          ) : email ? (
            <>
              <h2 className="font-serif text-xl text-ink">Nous contacter</h2>
              <a href={`mailto:${email}`} className="mt-2 inline-flex items-center gap-2 text-sm hover:text-rose-text">
                <MailIcon size={20} /> {email}
              </a>
            </>
          ) : null}
        </div>

        <div className={`flex items-center gap-4 md:pl-8 ${socials.length > 0 || (g.newsletter_enabled && email) ? "md:border-l md:border-line" : ""}`}>
          {socials.map(({ url, label, Icon }) => (
            <a
              key={label}
              href={url!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:text-rose-text"
            >
              <Icon size={28} />
              <span className="visually-hidden">{label} (nouvelle fenêtre)</span>
            </a>
          ))}
          {g.newsletter_enabled && email ? (
            <a
              href={`mailto:${email}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:text-rose-text"
            >
              <MailIcon size={27} />
              <span className="visually-hidden">Écrire à {email}</span>
            </a>
          ) : null}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col gap-3 py-4 text-[0.8125rem] text-brown-soft sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {INFO_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-rose-text">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p>© {new Date().getFullYear()} Mademoizelle Jane</p>
        </div>
      </div>
    </footer>
  );
}
