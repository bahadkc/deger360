import type { Metadata } from 'next';
import { ProcessSection } from '@/components/sections/process-section';
import { PageCTASection } from '@/components/sections/page-cta-section';

export const metadata: Metadata = {
  title: 'Süreç: Değer Kaybı Tazminatı Nasıl Alınır?',
  description: 'Başvuru, ekspertiz, sigorta ve ödeme. 4 adımda araç değer kaybı tazminatı alma sürecimiz. Tüm yasal işlemleri biz yönetiyoruz, siz sadece izleyin.',
};

export default function SurecPage() {
  return (
    <main>
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-4 sm:mb-6 md:mb-8 text-center">
          Değer Kaybı Tazminatı Süreci
        </h1>
        <p className="text-base sm:text-lg text-neutral-800 text-center mb-8 max-w-2xl mx-auto">
          Tüm süreci profesyonel ekibimiz yönetiyor. Siz sadece başvurunuzu yapın, gerisini biz halledelim.
        </p>
        
        <div className="max-w-4xl mx-auto">
          <ProcessSection />
        </div>
      </div>
      <PageCTASection />
    </main>
  );
}

