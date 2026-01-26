import type { Metadata } from 'next';
import Script from 'next/script';
import { ProcessSection } from '@/components/sections/process-section';
import { PageCTASection } from '@/components/sections/page-cta-section';

export const metadata: Metadata = {
  title: 'Süreç: Değer Kaybı Tazminatı Nasıl Alınır?',
  description: 'Başvuru, ekspertiz, sigorta ve ödeme. 4 adımda araç değer kaybı tazminatı alma sürecimiz. Tüm yasal işlemleri biz yönetiyoruz, siz sadece izleyin.',
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "6 Adımda Araç Değer Kaybı Alma Süreci",
  "description": "Değer360 ile araç değer kaybı tazminatı alma sürecinin adım adım rehberi. Tüm yasal işlemleri profesyonel ekibimiz yönetiyor.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "İlk Başvuru & Değerlendirme",
      "text": "Formunuzu doldurduğunuzda, uzman ekibimiz 2 saat içinde sizinle iletişime geçer.",
      "position": 1
    },
    {
      "@type": "HowToStep",
      "name": "Evrak Toplama & Ekspertiz",
      "text": "Gerekli tüm evrakları sizin için toplarız. Profesyonel ekspertiz raporunuzu hazırlarız.",
      "position": 2
    },
    {
      "@type": "HowToStep",
      "name": "Sigorta Başvurusu",
      "text": "Karşı tarafın sigortasına resmi başvurumuzu yaparız.",
      "position": 3
    },
    {
      "@type": "HowToStep",
      "name": "Müzakere & Takip",
      "text": "Sigorta şirketi ile müzakereleri gerçekleştiriz. Her adımı size bildiririz.",
      "position": 4
    },
    {
      "@type": "HowToStep",
      "name": "Tahkim/Dava Süreci",
      "text": "Gerekirse hukuki süreci başlatırız. Tüm işlemler bizim sorumluluğumuzda.",
      "position": 5
    },
    {
      "@type": "HowToStep",
      "name": "Ödeme & Sonuç",
      "text": "Süreç sonunda hak ediş tutarınız hesabınıza gönderilir.",
      "position": 6
    }
  ]
};

export default function SurecPage() {
  return (
    <main>
      <Script id="howto-schema" type="application/ld+json">
        {JSON.stringify(howToSchema)}
      </Script>
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

