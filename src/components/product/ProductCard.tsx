import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/utils/formatPrice";
import { MedalPlaceholder } from "@/components/ui/MedalPlaceholder";
import { Badge } from "@/components/ui/Badge";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/boutique/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-card bg-paper shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative p-4">
        <MedalPlaceholder shape={product.shape} colors={product.colors} className="rounded-2xl" />
        {product.badges.length > 0 && (
          <div className="absolute left-6 top-6 flex flex-col gap-2">
            {product.badges.map((badge) => (
              <Badge key={badge} tone={badge} />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-5 pb-5">
        <h3 className="font-display text-xl text-ink">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-ink-soft">{product.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-sm text-ink-soft">
            À partir de <span className="font-semibold text-ink">{formatPrice(product.basePriceCents)}</span>
          </span>
          <span className="text-sm font-medium text-clay transition-transform group-hover:translate-x-0.5">
            Personnaliser →
          </span>
        </div>
      </div>
    </Link>
  );
}
