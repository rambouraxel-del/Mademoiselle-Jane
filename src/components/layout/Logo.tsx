import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Mademoiselle Jane — Accueil">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-clay text-sm font-semibold text-white">
        MJ
      </span>
      <span className="font-display text-xl leading-none text-ink">Mademoiselle Jane</span>
    </Link>
  );
}
