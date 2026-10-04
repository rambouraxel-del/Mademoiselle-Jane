import Link from "next/link";
import { BagIcon } from "@/components/icons";
import { MediaImage } from "@/components/media-image";
import type { ProductImage } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";

type Props = {
  href: string;
  title: string;
  priceCents: number;
  image: ProductImage | null;
  available: boolean;
  personalizable?: boolean;
  variant?: "home" | "shop";
  priority?: boolean;
  priceFrom?: boolean;
};

export function ProductCard({
  href,
  title,
  priceCents,
  image,
  available,
  personalizable,
  variant = "shop",
  priority,
  priceFrom,
}: Props) {
  const price = `${priceFrom ? "À partir de " : ""}${formatPrice(priceCents)}`;
  return (
    <article className="group relative flex flex-col">
      <div
        className={`relative overflow-hidden rounded-[3px] bg-beige ${
          variant === "home" ? "aspect-[325/235]" : "aspect-[325/288]"
        }`}
      >
        <MediaImage
          media={image?.media}
          alt={image?.alt ?? title}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
          priority={priority}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />
        {variant === "shop" && personalizable ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-blush-soft/95 px-3.5 py-1 text-[0.72rem] font-medium text-ink shadow-sm sm:left-3 sm:top-3">
            Personnalisable
          </span>
        ) : null}
        {!available ? (
          <span className="absolute right-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-[0.72rem] font-medium text-white">
            Indisponible
          </span>
        ) : null}
      </div>

      {variant === "home" ? (
        <div className="flex items-start justify-between gap-3 px-1 pt-3 sm:px-4">
          <div>
            <h3 className="font-serif text-[1.3rem] leading-tight text-ink">
              <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
                {title}
              </Link>
            </h3>
            <p className="mt-1 font-serif text-[1.3rem] text-ink">{price}</p>
          </div>
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blush text-ink transition-colors group-hover:bg-rose group-hover:text-white"
          >
            <BagIcon size={22} />
          </span>
        </div>
      ) : (
        <div className="px-1 pt-2.5 sm:px-1.5">
          <h3 className="font-serif text-[1.3rem] leading-snug text-ink sm:text-[1.45rem]">
            <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
              {title}
            </Link>
          </h3>
          <p className="font-serif text-[1.3rem] text-ink sm:text-[1.45rem]">{price}</p>
        </div>
      )}
    </article>
  );
}
