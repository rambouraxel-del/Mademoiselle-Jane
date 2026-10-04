"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/medias", label: "Photos et médias" },
  { href: "/admin/contenus", label: "Contenus du site" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/reglages", label: "Livraison et réglages" },
];

function active(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminNav({ name, badges, signOut }: { name: string; badges: Record<string, number>; signOut: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const links = (
    <ul className="space-y-0.5">
      {ADMIN_LINKS.map((l) => {
        const isActive = active(pathname, l.href);
        const badge = badges[l.href];
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 items-center justify-between rounded-md px-3 text-[0.95rem] ${
                isActive ? "bg-blush text-ink" : "text-brown hover:bg-ivory-deep hover:text-ink"
              }`}
            >
              {l.label}
              {badge ? (
                <span className="rounded-full bg-rose px-2 py-0.5 text-xs font-semibold text-white">{badge}</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Barre mobile */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
          <span className="visually-hidden">Menu de l’administration</span>
        </button>
        <span className="font-serif text-lg text-ink">Administration</span>
        <Link href="/" className="text-sm text-rose-text underline" target="_blank">
          Voir le site
        </Link>
      </div>
      <div id="admin-menu" hidden={!open} className="border-b border-line bg-white px-3 py-3 lg:hidden">
        <nav aria-label="Administration">{links}</nav>
        <div className="mt-3 border-t border-line pt-3 text-sm">
          <p className="px-3 text-brown-soft">Connecté·e : {name}</p>
          <div className="mt-2 px-1">{signOut}</div>
        </div>
      </div>

      {/* Barre latérale ordinateur */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-white px-3 py-5 lg:flex">
        <Link href="/admin" className="mb-6 px-3 font-serif text-xl text-ink">
          Mademoizelle Jane
          <span className="block font-sans text-xs uppercase tracking-[0.2em] text-brown-soft">Administration</span>
        </Link>
        <nav aria-label="Administration" className="flex-1 overflow-y-auto">
          {links}
        </nav>
        <div className="border-t border-line px-3 pt-4 text-sm">
          <Link href="/" target="_blank" className="mb-3 block text-rose-text underline underline-offset-2">
            Voir le site ↗
          </Link>
          <p className="truncate text-brown-soft">Connecté·e : {name}</p>
          <div className="mt-2">{signOut}</div>
        </div>
      </aside>
    </>
  );
}
