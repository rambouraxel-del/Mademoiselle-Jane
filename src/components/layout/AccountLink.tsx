import Link from "next/link";

export function AccountLink() {
  return (
    <Link
      href="/compte"
      className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream-soft"
      aria-label="Mon compte"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M5 19.2c1.4-3 4-4.6 7-4.6s5.6 1.6 7 4.6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}
