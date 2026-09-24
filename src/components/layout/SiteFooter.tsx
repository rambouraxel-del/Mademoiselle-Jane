import Link from "next/link";
import { Logo } from "./Logo";
import { navLinks } from "./navLinks";

const legalLinks = [
  { href: "/faq", label: "Livraison & retours" },
  { href: "/faq", label: "Entretien de la résine" },
  { href: "/contact", label: "Mentions légales" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-cream-soft">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm text-ink-soft">
            Médailles pour chiens coulées et personnalisées à la main, en résine
            époxy, dans notre atelier.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-ink">Navigation</h3>
          <ul className="flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-ink-soft hover:text-clay">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-ink">Informations</h3>
          <ul className="flex flex-col gap-2.5">
            {legalLinks.map((link, index) => (
              <li key={`${link.href}-${index}`}>
                <Link href={link.href} className="text-sm text-ink-soft hover:text-clay">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-ink">Atelier</h3>
          <p className="text-sm text-ink-soft">
            contact@mademoiselle-jane.fr
            <br />
            Du lundi au vendredi, 9h–17h
          </p>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="container-site flex flex-col gap-2 py-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Mademoiselle Jane. Tous droits réservés.</p>
          <p>Site vitrine — version de démonstration.</p>
        </div>
      </div>
    </footer>
  );
}
