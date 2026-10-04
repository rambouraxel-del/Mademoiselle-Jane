export default function Loading() {
  return (
    <div className="container-site flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-blush border-t-rose" aria-hidden="true" />
      <span className="visually-hidden">Chargement…</span>
    </div>
  );
}
