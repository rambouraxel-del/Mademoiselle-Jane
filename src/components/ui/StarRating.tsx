export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} étoiles sur ${max}`}>
      {Array.from({ length: max }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${index < rating ? "fill-amber" : "fill-border"}`}
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}
