import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/auth-forms";
import { Notice } from "@/components/admin/ui";
import { getAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/connexion">) {
  if (await getAdmin()) redirect("/admin");
  const sp = await searchParams;
  return (
    <>
      <h1 className="mb-5 font-serif text-2xl text-ink">Administration</h1>
      {sp.lien === "expire" ? <div className="mb-4"><Notice tone="error">Ce lien a expiré ou a déjà été utilisé.</Notice></div> : null}
      {sp.refus ? <div className="mb-4"><Notice tone="warning">Connectez-vous avec un compte administrateur.</Notice></div> : null}
      <LoginForm />
    </>
  );
}
