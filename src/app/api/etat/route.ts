import { deploymentDiagnostic } from "@/lib/preview/diagnostic";

export const dynamic = "force-dynamic";

/** État du déploiement (aucune donnée sensible) : utile pour vérifier l'activation de l'aperçu. */
export function GET() {
  return Response.json(deploymentDiagnostic(), { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
