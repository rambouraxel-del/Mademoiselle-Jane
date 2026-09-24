"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { navLinks } from "./navLinks";
import { CartIndicator } from "./CartIndicator";
import { AccountLink } from "./AccountLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/utils/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-cream/90 backdrop-blur-md">
      <div className="container-site flex h-20 items-center justify-between gap-4 py-3">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-clay",
                  active ? "text-clay" : "text-ink-soft"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden lg:block">
            <ButtonLink href="/boutique" size="sm">
              Créer sa médaille
            </ButtonLink>
          </div>
          <AccountLink />
          <CartIndicator />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-cream-soft md:hidden"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border/70 bg-cream md:hidden">
          <nav className="container-site flex flex-col gap-1 py-4">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-3 text-base font-medium transition-colors",
                    active ? "bg-cream-soft text-clay" : "text-ink hover:bg-cream-soft"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <ButtonLink href="/boutique" onClick={() => setMenuOpen(false)} className="mt-2 justify-center">
              Créer sa médaille
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
