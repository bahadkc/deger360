import { HeroSection } from '@/components/sections/hero-section';
import { StatsSection } from '@/components/sections/stats-section';
import { WhatIsSection } from '@/components/sections/what-is-section';
import { ProcessSection } from '@/components/sections/process-section';
import { WhyUsSection } from '@/components/sections/why-us-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { AboutSection } from '@/components/sections/about-section';
import { FAQSection } from '@/components/sections/faq-section';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <WhatIsSection />
      <ProcessSection />
      <WhyUsSection />
      <StatsSection />
      <TestimonialsSection />
      <AboutSection />
      <FAQSection />
    </main>
  );
}
