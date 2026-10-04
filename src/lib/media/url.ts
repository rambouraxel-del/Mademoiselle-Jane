/** URL publique d'un fichier du bucket de médias Supabase. */
export function publicMediaUrl(path: string, bucket = "media"): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}
