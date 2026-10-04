import type { Metadata } from "next";
import { ResetRequestForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-2 font-serif text-2xl text-ink">Mot de passe oublié</h1>
      <p className="mb-5 text-sm text-brown-soft">Vous recevrez un lien pour choisir un nouveau mot de passe.</p>
      <ResetRequestForm />
    </>
  );
}
