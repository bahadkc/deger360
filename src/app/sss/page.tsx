import type { Metadata } from 'next';
import Script from 'next/script';
import { FAQSection } from '@/components/sections/faq-section';
import { PageCTASection } from '@/components/sections/page-cta-section';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular - Araç Değer Kaybı',
  description: 'Değer kaybı şartları nelerdir? Kimler alabilir? Kaç yıl geriye dönük alınır? Ekspertiz raporu ücretli mi? Tüm merak edilenler burada.',
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Değer kaybı tazminatı nedir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kaza sonrası aracınızın piyasa değerinde oluşan düşüşün tazminatıdır. Tamir edilmiş olsa bile, kaza geçirmiş araçların değeri düşer ve bu farkı karşı tarafın sigortasından alabilirsiniz."
      }
    },
    {
      "@type": "Question",
      "name": "Ne kadar tazminat alabilirim?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tazminat tutarı aracınızın markası, modeli, yaşı, hasar tutarı ve piyasa değerine göre değişir."
      }
    },
    {
      "@type": "Question",
      "name": "Ön ödeme yapmam gerekiyor mu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Hayır! Biz ön ödeme almıyoruz. Masraflar bizde. Kendi ücretimizi sadece size tazminatı gönderirken alıyoruz. Risk tamamen bizde."
      }
    },
    {
      "@type": "Question",
      "name": "Süreç ne kadar sürer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ortalama 3-6 ay içinde sonuçlanır. İlk başvurudan sonra 2 saat içinde sizinle iletişime geçeriz ve süreci başlatırız."
      }
    },
    {
      "@type": "Question",
      "name": "Hangi evraklara ihtiyacım var?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kaza tutanağı, ekspertiz raporu, tamir faturası ve araç ruhsatı gibi temel evraklar yeterli. Eksik evrakları biz topluyoruz."
      }
    },
    {
      "@type": "Question",
      "name": "Kazanma garantisi var mı?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "%97 başarı oranımız ve 750+ başarılı davamız var. Ücretsiz değerlendirme ile durumunuzu öğrenebilirsiniz."
      }
    },
    {
      "@type": "Question",
      "name": "Araç değer kaybı başvurusu için zaman aşımı süresi nedir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kaza tarihinden itibaren 2 yıl içerisinde başvuru yapılması gerekmektedir. Bu süreyi geçiren dosyalar zaman aşımına uğrar."
      }
    },
    {
      "@type": "Question",
      "name": "Değer360 ile değer kaybı başvurusu ücretli mi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Hayır, ön inceleme ve başvuru süreci tamamen ücretsizdir. Sadece tazminat başarıyla alındığında, önceden belirlenen oran üzerinden hizmet bedeli alınır."
      }
    }
  ]
};

export default function SSSPage() {
  return (
    <main>
      <Script id="faq-schema" type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </Script>
      <FAQSection />
      <PageCTASection />
    </main>
  );
}

