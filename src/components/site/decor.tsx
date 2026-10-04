/** Détails décoratifs dessinés à la main (cœurs, traits) repris des maquettes. */

type DecoProps = { className?: string; size?: number };

/** Petit cœur au trait, légèrement irrégulier. */
export function DoodleHeart({ className = "", size = 28 }: DecoProps) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 40 44"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`text-rose-deco ${className}`}
    >
      <path
        d="M20.5 41C17 33 4.5 22.5 5.2 12.4 5.7 6 12.6 3.5 16.8 7.6c1.8 1.8 2.9 4.2 3.4 6.7.4-2.6 1.7-5.4 4-7.3 4.6-3.8 11.3-1.1 11 5.4-.4 10-11.4 19.4-14.7 28.6Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Cœur suivi d'un trait souple (ouverture « Notre histoire »). */
export function HeartSwoosh({ className = "" }: { className?: string }) {
  return (
    <svg
      width="150"
      height="42"
      viewBox="0 0 150 42"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`text-rose-deco ${className}`}
    >
      <path
        d="M14 39C11.5 33 3 25.5 3.5 18.5c.3-4.5 5.2-6.2 8.1-3.3 1.3 1.3 2 2.9 2.4 4.7.3-1.8 1.2-3.8 2.8-5.1 3.2-2.7 7.9-.8 7.7 3.8-.3 7-8 13.5-10.5 20.4Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path d="M40 30c25-8 60-12 106-11" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  );
}

/** Boucle avec cœur (bandeau citation de la boutique). */
export function LoopHeart({ className = "" }: { className?: string }) {
  return (
    <svg
      width="270"
      height="96"
      viewBox="0 0 270 96"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`text-rose-deco ${className}`}
    >
      <path
        d="M4 86C30 62 70 56 104 64c8 2 13 5 17 8"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <path
        d="M121 72c-9-9-24-21-25-35-1-11 9-17 17-12 4 3 7 8 8 13 1-6 4-12 9-15 9-5 18 2 16 13-2 13-15 25-25 36Z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path d="M121 72c26 8 70 4 145-30" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

/** Titre encadré de deux filets (« — Les petits coups de cœur — »). */
export function RuledTitle({
  children,
  as: Tag = "h2",
  className = "",
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-5 sm:gap-8 ${className}`}>
      <span className="hidden h-px w-16 bg-brown/40 sm:block md:w-24" aria-hidden="true" />
      <Tag className="text-center text-[1.85rem] sm:text-[2.2rem] lg:text-[2.45rem]">{children}</Tag>
      <span className="hidden h-px w-16 bg-brown/40 sm:block md:w-24" aria-hidden="true" />
    </div>
  );
}
