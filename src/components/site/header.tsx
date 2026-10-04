"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useCartCount } from "@/components/cart/cart-store";
import { NAV_LINKS } from "./nav-links";
import { BagIcon, CloseIcon, HeartFilledIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/icons";


function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({
  logo,
  announcement,
}: {
  logo: React.ReactNode;
  announcement: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const count = useCartCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const menuId = useId();
  const searchId = useId();

  // Ferme menu et recherche à chaque changement de page
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, searchOpen]);

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
    router.push(q ? `/medailles?q=${encodeURIComponent(q)}` : "/medailles");
  }

  return (
    <header className="relative z-40 bg-ivory">
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>

      {announcement ? (
        <div className="bg-blush text-ink">
          <p className="container-site flex min-h-9 items-center justify-center gap-2 py-1.5 text-center text-[0.8125rem] tracking-[0.02em] sm:text-sm">
            <span>{announcement}</span>
            <HeartFilledIcon size={14} className="shrink-0 text-rose-deco" />
          </p>
        </div>
      ) : null}

      <div className="border-b border-line">
        <div className="container-site relative">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-2 lg:pt-6 lg:pb-1">
            {/* Gauche : menu mobile + recherche */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:text-rose-dark lg:hidden"
                aria-expanded={menuOpen}
                aria-controls={menuId}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <CloseIcon size={26} /> : <MenuIcon size={26} />}
                <span className="visually-hidden">{menuOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:text-rose-dark lg:-ml-2"
                aria-expanded={searchOpen}
                aria-controls={searchId}
                onClick={() => setSearchOpen((v) => !v)}
              >
                <SearchIcon size={25} />
                <span className="visually-hidden">Rechercher une médaille</span>
              </button>
            </div>

            {/* Centre : logo */}
            <Link href="/" className="block w-[11.5rem] sm:w-[15rem] lg:w-[25.5rem]" aria-label="Mademoizelle Jane — accueil">
              {logo}
            </Link>

            {/* Droite : suivi de commande + panier */}
            <div className="flex items-center justify-end gap-1 sm:gap-2">
              <Link
                href="/commande/suivi"
                className="hidden h-11 w-11 items-center justify-center rounded-full text-ink hover:text-rose-dark sm:inline-flex"
                title="Suivre ma commande"
              >
                <UserIcon size={27} />
                <span className="visually-hidden">Suivre ma commande</span>
              </Link>
              <Link
                href="/panier"
                className="relative -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:text-rose-dark"
              >
                <BagIcon size={27} />
                <span className="visually-hidden">Panier, {count} article{count > 1 ? "s" : ""}</span>
                {count > 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-[0.7rem] font-semibold text-white"
                  >
                    {count}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>

          {/* Navigation principale (ordinateur) */}
          <nav aria-label="Navigation principale" className="hidden justify-center lg:flex">
            <ul className="flex items-center gap-14 pb-3 pt-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative inline-block py-2 text-[1.0625rem] tracking-[0.01em] transition-colors ${
                        active ? "text-rose-text" : "text-ink hover:text-rose-text"
                      }`}
                    >
                      {link.label}
                      {active ? (
                        <span className="absolute inset-x-0 -bottom-0.5 h-[1.5px] bg-rose-deco" aria-hidden="true" />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Recherche */}
      {searchOpen ? (
        <div id={searchId} className="absolute inset-x-0 top-full border-b border-line bg-ivory shadow-[var(--shadow-soft)]">
          <form role="search" onSubmit={onSearch} className="container-site flex items-center gap-3 py-4">
            <label htmlFor={`${searchId}-input`} className="visually-hidden">
              Rechercher une médaille
            </label>
            <SearchIcon size={22} className="shrink-0 text-brown-soft" />
            <input
              ref={searchInput}
              id={`${searchId}-input`}
              name="q"
              type="search"
              maxLength={80}
              placeholder="Rechercher une médaille (forme, finition…)"
              className="min-w-0 flex-1 border-0 bg-transparent py-2 text-lg text-ink outline-none placeholder:text-brown-soft/70"
            />
            <button type="submit" className="btn btn-primary btn-pill !px-5 !py-2 text-sm">
              Rechercher
            </button>
          </form>
        </div>
      ) : null}

      {/* Menu mobile */}
      <div
        id={menuId}
        hidden={!menuOpen}
        className="absolute inset-x-0 top-full border-b border-line bg-ivory shadow-[var(--shadow-soft)] lg:hidden"
      >
        <nav aria-label="Navigation mobile" className="container-site py-3">
          <ul className="divide-y divide-line">
            {[...NAV_LINKS, { href: "/commande/suivi", label: "Suivre ma commande" }].map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center font-serif text-xl ${active ? "text-rose-text" : "text-ink"}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
