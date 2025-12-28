import type { Metadata } from 'next';
import { ContactFormSection } from '@/components/sections/contact-form-section';

export const metadata: Metadata = {
  title: 'İletişim - Değer Kaybı Danışmanlığı',
  description: 'Bizimle iletişime geçin. Değer kaybı tazminatı için ücretsiz değerlendirme. Formu doldurun, 2 saat içinde size dönüş yapalım!',
};

export default function IletisimPage() {
  return (
    <main className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-4 sm:mb-6 md:mb-8 text-center">
          İletişim
        </h1>
        <p className="text-base sm:text-lg text-neutral-800 text-center max-w-2xl mx-auto">
          Değer kaybı tazminatı için ücretsiz değerlendirme alın. Formu doldurun, 2 saat içinde size dönüş yapalım.
        </p>
      </div>
      <ContactFormSection />
    </main>
  );
}

