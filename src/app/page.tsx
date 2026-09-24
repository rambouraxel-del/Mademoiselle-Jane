import { Hero } from "@/components/home/Hero";
import { ConceptSection } from "@/components/home/ConceptSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CraftProcess } from "@/components/home/CraftProcess";
import { CustomizationShowcase } from "@/components/home/CustomizationShowcase";
import { Gallery } from "@/components/home/Gallery";
import { Advantages } from "@/components/home/Advantages";
import { Testimonials } from "@/components/home/Testimonials";
import { FaqPreview } from "@/components/home/FaqPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ConceptSection />
      <FeaturedProducts />
      <CraftProcess />
      <CustomizationShowcase />
      <Gallery />
      <Advantages />
      <Testimonials />
      <FaqPreview />
    </>
  );
}
