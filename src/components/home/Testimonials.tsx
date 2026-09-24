import { demoTestimonials } from "@/data/testimonials";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StarRating } from "@/components/ui/StarRating";

export function Testimonials() {
  return (
    <section className="container-site py-16 sm:py-20">
      <SectionHeading
        eyebrow="Avis"
        title="Ce qu'en disent les compagnons (et leurs humains)"
        align="center"
        className="mx-auto"
      />
      <p className="mx-auto mt-2 max-w-md text-center text-xs text-ink-soft">
        Témoignages de démonstration à titre d&apos;exemple — à remplacer par de vrais avis clients.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {demoTestimonials.map((testimonial) => (
          <figure key={testimonial.id} className="flex flex-col gap-4 rounded-card border border-border/70 bg-paper p-6">
            <StarRating rating={testimonial.rating} />
            <blockquote className="text-sm text-ink-soft">&ldquo;{testimonial.quote}&rdquo;</blockquote>
            <figcaption className="mt-auto text-sm font-medium text-ink">
              {testimonial.authorName} &amp; {testimonial.dogName}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
