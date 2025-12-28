import type { Metadata } from 'next';
import { FAQSection } from '@/components/sections/faq-section';

export const metadata: Metadata = {
  title: 'SSS - Sıkça Sorulan Sorular',
  description: 'Değer kaybı tazminatı hakkında sıkça sorulan sorular ve cevapları. Merak ettiklerinizin cevapları burada. Hemen okuyun ve başvurun!',
};

export default function SSSPage() {
  return (
    <main className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-4 sm:mb-6 md:mb-8 text-center">
          Sıkça Sorulan Sorular
        </h1>
      </div>
      <FAQSection />
    </main>
  );
}

