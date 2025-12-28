import type { Metadata } from 'next';
import { ProcessSection } from '@/components/sections/process-section';

export const metadata: Metadata = {
  title: 'Süreç - Değer Kaybı Danışmanlığı',
  description: 'Değer kaybı tazminatı sürecimiz: Başvuru, ekspertiz, sigorta başvurusu ve dava takibi. Tüm süreci biz yönetiyoruz, siz sadece takip edin. Hemen başvurun!',
};

export default function SurecPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-4 sm:mb-6 md:mb-8 text-center">
        Değer Kaybı Tazminatı Süreci
      </h1>
      <p className="text-base sm:text-lg text-neutral-800 text-center mb-8 max-w-2xl mx-auto">
        Tüm süreci profesyonel ekibimiz yönetiyor. Siz sadece başvurunuzu yapın, gerisini biz halledelim.
      </p>
      
      <div className="max-w-4xl mx-auto">
        <ProcessSection />
      </div>
    </main>
  );
}

