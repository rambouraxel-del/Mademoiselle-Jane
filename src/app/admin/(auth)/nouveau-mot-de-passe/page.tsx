import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function NewPasswordPage() {
  return (
    <>
      <h1 className="mb-5 font-serif text-2xl text-ink">Choisir un nouveau mot de passe</h1>
      <NewPasswordForm />
    </>
  );
}
