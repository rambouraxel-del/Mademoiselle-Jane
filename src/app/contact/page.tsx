import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur une médaille, une commande ou un délai ? Contactez l'atelier Mademoiselle Jane.",
};

export default function ContactPage() {
  return (
    <div className="container-site py-12 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Contact</span>
          <h1 className="mt-3 font-display text-3xl text-ink sm:text-4xl">Une question ?</h1>
          <p className="mt-3 text-ink-soft">
            Écrivez-nous pour toute question sur une médaille, une commande en cours ou un délai de
            fabrication. Nous répondons sous 48h ouvrées.
          </p>
          <dl className="mt-8 flex flex-col gap-4 text-sm">
            <div>
              <dt className="font-semibold text-ink">Email</dt>
              <dd className="text-ink-soft">contact@mademoiselle-jane.fr</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Horaires</dt>
              <dd className="text-ink-soft">Du lundi au vendredi, 9h–17h</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-card border border-border/70 bg-paper p-6 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
