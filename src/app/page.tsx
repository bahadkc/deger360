import Script from 'next/script';
import { HeroSection } from '@/components/sections/hero-section';
import { StatsSection } from '@/components/sections/stats-section';
import { WhatIsSection } from '@/components/sections/what-is-section';
import { ProcessSection } from '@/components/sections/process-section';
import { WhyUsSection } from '@/components/sections/why-us-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { AboutSection } from '@/components/sections/about-section';
import { FAQSection } from '@/components/sections/faq-section';
import { HashScrollHandler } from '@/components/hash-scroll-handler';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deger360.net';

const corporateSchema = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "Değer360",
  "image": `${siteUrl}/icon.png`,
  "description": "Araç değer kaybı, kaza tazminatı ve sigorta hukuku konularında uzman danışmanlık hizmeti.",
  "telephone": "+90 505 705 33 05",
  "priceRange": "Ücretsiz Danışmanlık",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Türkiye",
    "addressCountry": "TR"
  },
  "url": siteUrl
};

export default function Home() {
  return (
    <main>
      <Script id="corporate-schema" type="application/ld+json">
        {JSON.stringify(corporateSchema)}
      </Script>
      <HashScrollHandler />
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
