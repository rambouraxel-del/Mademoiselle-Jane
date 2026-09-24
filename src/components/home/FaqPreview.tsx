import { faqItems } from "@/data/faq";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { FaqAccordion } from "@/components/faq/FaqAccordion";

export function FaqPreview() {
  const preview = faqItems.slice(0, 4);

  return (
    <section className="bg-cream-soft py-16 sm:py-20">
      <div className="container-site max-w-3xl">
        <SectionHeading eyebrow="Questions fréquentes" title="Tout savoir avant de commander" align="center" className="mx-auto" />
        <div className="mt-10">
          <FaqAccordion items={preview} />
        </div>
        <div className="mt-8 text-center">
          <ButtonLink href="/faq" variant="outline">
            Voir toute la FAQ
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
