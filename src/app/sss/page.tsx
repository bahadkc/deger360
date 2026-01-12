import type { Metadata } from 'next';
import { FAQSection } from '@/components/sections/faq-section';
import { PageCTASection } from '@/components/sections/page-cta-section';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular - Araç Değer Kaybı',
  description: 'Değer kaybı şartları nelerdir? Kimler alabilir? Kaç yıl geriye dönük alınır? Ekspertiz raporu ücretli mi? Tüm merak edilenler burada.',
};

export default function SSSPage() {
  return (
    <main>
      <FAQSection />
      <PageCTASection />
    </main>
  );
}

