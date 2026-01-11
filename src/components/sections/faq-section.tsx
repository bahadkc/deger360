// Server Component - SEO dostu, içerik sunucuda render edilir
import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { FAQAccordion } from './faq-accordion';

const faqs = [
  {
    question: 'Değer kaybı tazminatı nedir?',
    answer: 'Kaza sonrası aracınızın piyasa değerinde oluşan düşüşün tazminatıdır. Tamir edilmiş olsa bile, kaza geçirmiş araçların değeri düşer ve bu farkı karşı tarafın sigortasından alabilirsiniz.',
  },
  {
    question: 'Ne kadar tazminat alabilirim?',
    answer: 'Tazminat tutarı aracınızın markası, modeli, yaşı, hasar tutarı ve piyasa değerine göre değişir.',
  },
  {
    question: 'Ön ödeme yapmam gerekiyor mu?',
    answer: 'Hayır! Biz ön ödeme almıyoruz. Masraflar bizde. Kendi ücretimizi sadece size tazminatı gönderirken alıyoruz. Risk tamamen bizde.',
  },
  {
    question: 'Süreç ne kadar sürer?',
    answer: 'Ortalama 3-6 ay içinde sonuçlanır. İlk başvurudan sonra 2 saat içinde sizinle iletişime geçeriz ve süreci başlatırız.',
  },
  {
    question: 'Hangi evraklara ihtiyacım var?',
    answer: 'Kaza tutanağı, ekspertiz raporu, tamir faturası ve araç ruhsatı gibi temel evraklar yeterli. Eksik evrakları biz topluyoruz.',
  },
  {
    question: 'Kazanma garantisi var mı?',
    answer: '%97 başarı oranımız ve 750+ başarılı davamız var. Ücretsiz değerlendirme ile durumunuzu öğrenebilirsiniz.',
  },
];

export function FAQSection() {
  return (
    <section id="sss" className="py-12 sm:py-16 md:py-20 bg-white">
      <ScrollAnimation>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-3 sm:mb-4">
                Sıkça Sorulan Sorular
              </h2>
              <p className="text-base sm:text-lg text-neutral-800 px-2">
                Merak ettiklerinizin cevapları
              </p>
            </div>

            <FAQAccordion faqs={faqs} />
          </div>
        </div>
      </ScrollAnimation>
    </section>
  );
}
