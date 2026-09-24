"use client";

import { useState, type FormEvent } from "react";
import { submitContactForm } from "@/services/contact";
import { TextInput, TextArea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(undefined);

    const result = await submitContactForm(values);

    if (result.success) {
      setStatus("success");
      setValues({ name: "", email: "", subject: "", message: "" });
    } else {
      setStatus("error");
      setError(result.error ?? "Une erreur est survenue, merci de réessayer.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-card border border-success/30 bg-success/10 p-6 text-center">
        <p className="font-medium text-ink">Merci, votre message a bien été envoyé !</p>
        <p className="mt-1 text-sm text-ink-soft">Nous vous répondrons dans les plus brefs délais.</p>
        <Button variant="outline" className="mt-4" onClick={() => setStatus("idle")}>
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextInput
        label="Nom"
        required
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        placeholder="Votre nom"
      />
      <TextInput
        label="Email"
        type="email"
        required
        value={values.email}
        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        placeholder="vous@exemple.fr"
      />
      <TextInput
        label="Objet"
        required
        value={values.subject}
        onChange={(e) => setValues((v) => ({ ...v, subject: e.target.value }))}
        placeholder="Objet de votre message"
      />
      <TextArea
        label="Message"
        required
        value={values.message}
        onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
        placeholder="Votre message"
      />

      {status === "error" && (
        <p role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === "loading"} className="mt-2 self-start">
        {status === "loading" ? "Envoi en cours…" : "Envoyer le message"}
      </Button>
    </form>
  );
}
