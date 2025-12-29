'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

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
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="sss" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-3 sm:mb-4">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-base sm:text-lg text-neutral-800 px-2">
              Merak ettiklerinizin cevapları
            </p>
          </motion.div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-neutral-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-neutral-100 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-dark-blue pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-orange flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary-orange flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-sm sm:text-base text-neutral-800">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
