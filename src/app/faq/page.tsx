import type { Metadata } from "next";
import { faqItems } from "@/data/faq";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Fabrication, personnalisation, livraison, entretien : toutes les réponses à vos questions.",
};

const categoryLabels: Record<string, string> = {
  fabrication: "Fabrication",
  personnalisation: "Personnalisation",
  livraison: "Livraison",
  entretien: "Entretien",
  commande: "Commande",
};

export default function FaqPage() {
  const categories = Array.from(new Set(faqItems.map((item) => item.category)));

  return (
    <div className="container-site py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">FAQ</span>
        <h1 className="mt-3 font-display text-3xl text-ink sm:text-4xl">Questions fréquentes</h1>
        <p className="mt-3 text-ink-soft">
          Fabrication, personnalisation, livraison, entretien, commande : retrouvez toutes les
          réponses. Une autre question ?{" "}
          <ButtonLink href="/contact" variant="ghost" size="sm" className="px-1 underline">
            Contactez-nous
          </ButtonLink>
        </p>
      </div>

      <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-10">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="mb-4 font-display text-xl text-ink">{categoryLabels[category] ?? category}</h2>
            <FaqAccordion items={faqItems.filter((item) => item.category === category)} />
          </div>
        ))}
      </div>
    </div>
  );
}
