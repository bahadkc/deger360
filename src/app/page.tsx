import Script from 'next/script';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/sections/hero-section';
import { HashScrollHandler } from '@/components/hash-scroll-handler';

// Lazy load below-the-fold sections to reduce initial bundle size and main-thread work
// These sections are not visible on first paint, so they can load after initial render
const WhatIsSection = dynamic(() => import('@/components/sections/what-is-section').then(mod => ({ default: mod.WhatIsSection })), {
  ssr: true, // Keep SSR for SEO
});

const ProcessSection = dynamic(() => import('@/components/sections/process-section').then(mod => ({ default: mod.ProcessSection })), {
  ssr: true,
});

const WhyUsSection = dynamic(() => import('@/components/sections/why-us-section').then(mod => ({ default: mod.WhyUsSection })), {
  ssr: true,
});

const StatsSection = dynamic(() => import('@/components/sections/stats-section').then(mod => ({ default: mod.StatsSection })), {
  ssr: true,
});

const TestimonialsSection = dynamic(() => import('@/components/sections/testimonials-section').then(mod => ({ default: mod.TestimonialsSection })), {
  ssr: true,
});

const AboutSection = dynamic(() => import('@/components/sections/about-section').then(mod => ({ default: mod.AboutSection })), {
  ssr: true,
});

const FAQSection = dynamic(() => import('@/components/sections/faq-section').then(mod => ({ default: mod.FAQSection })), {
  ssr: true,
});

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
