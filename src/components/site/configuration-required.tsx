import { deploymentDiagnostic, VERCEL_ENV_LABELS } from "@/lib/preview/diagnostic";

/** Page affichée si ni Supabase ni le mode aperçu ne sont configurés, avec un diagnostic précis. */
export function ConfigurationRequired() {
  const d = deploymentDiagnostic();
  const envLabel = d.vercelEnvironment ? (VERCEL_ENV_LABELS[d.vercelEnvironment] ?? d.vercelEnvironment) : null;
  const variableState =
    d.previewVariable === "absente"
      ? "absente de ce déploiement"
      : d.previewVariable === "vide"
        ? "présente mais vide"
        : `présente avec la valeur « ${d.previewValue ?? ""} », non reconnue (attendu : true)`;
  return (
    <main className="container-site max-w-2xl py-20">
      <h1 className="text-center text-4xl">Configuration requise</h1>
      <p className="mx-auto mt-4 text-center">
        La base de données n’est pas encore connectée et le mode aperçu n’est pas activé.
      </p>
      <div className="mt-8 rounded-[3px] border border-line bg-[#fffdfa] p-5 text-[0.95rem]">
        <h2 className="text-xl">Diagnostic</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            Variable <code>PREVIEW_MODE</code> : {variableState}.
          </li>
          {envLabel ? (
            <li>
              Environnement Vercel de ce déploiement : <strong>{envLabel}</strong>
              {d.branch ? <> (branche <code>{d.branch}</code>{d.commit ? <>, commit <code>{d.commit}</code></> : null})</> : null}.
            </li>
          ) : null}
          <li>Supabase : {d.supabaseConfigured ? "configuré" : "non configuré"}.</li>
        </ul>
        <h2 className="mt-5 text-xl">Pour afficher l’aperçu visuel</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>
            Vercel → projet → <strong>Settings → Environment Variables</strong>.
          </li>
          <li>
            Ajoutez <code>PREVIEW_MODE</code> = <code>true</code> en cochant l’environnement{" "}
            <strong>{envLabel ?? "utilisé par ce déploiement"}</strong>.
          </li>
          <li>
            <strong>Deployments</strong> → ce déploiement → <strong>Redeploy</strong> (une variable ne s’applique
            qu’aux nouveaux déploiements).
          </li>
        </ol>
        <p className="mt-4 text-sm text-brown-soft">
          Pour la boutique réelle, renseignez plutôt les variables Supabase du fichier <code>.env.example</code>.
        </p>
      </div>
    </main>
  );
}
