'use client';

import { FileText, Search, Send, MessageCircle, Scale, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    number: 1,
    title: 'İlk Başvuru & Değerlendirme',
    description: 'Formunuzu doldurduğunuzda, uzman ekibimiz 2 saat içinde sizinle iletişime geçer.',
    duration: '1 Gün',
    icon: FileText,
  },
  {
    number: 2,
    title: 'Evrak Toplama & Ekspertiz',
    description: 'Gerekli tüm evrakları sizin için toplarız. Profesyonel ekspertiz raporunuzu hazırlarız.',
    duration: '3-5 Gün',
    icon: Search,
  },
  {
    number: 3,
    title: 'Sigorta Başvurusu',
    description: 'Karşı tarafın sigortasına resmi başvurumuzu yaparız.',
    duration: '1 Hafta',
    icon: Send,
  },
  {
    number: 4,
    title: 'Müzakere & Takip',
    description: 'Sigorta şirketi ile müzakereleri gerçekleştiriz. Her adımı size bildiririz.',
    duration: '1-2 Ay',
    icon: MessageCircle,
  },
  {
    number: 5,
    title: 'Tahkim/Dava Süreci',
    description: 'Gerekirse hukuki süreci başlatırız. Tüm işlemler bizim sorumluluğumuzda.',
    duration: '2-4 Ay',
    icon: Scale,
  },
  {
    number: 6,
    title: 'Ödeme & Sonuç',
    description: 'Tazminatınız hesabınıza geçer. Komisyonumuzu tazminattan alırız!',
    duration: 'Sonuç',
    icon: CheckCircle,
  },
];

export function ProcessSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="surec" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">
            Nasıl Çalışır? 6 Basit Adım
          </h2>
          <p className="text-lg text-neutral-800">
            Tüm süreci biz yönetiyoruz, siz sadece takip edin
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-8 pb-12 last:pb-0"
              >
                {/* Vertical Line */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-[15px] top-12 bottom-0 w-0.5 bg-primary-blue/20" />
                )}
                {/* Step */}
                <div className="flex gap-6">
                  {/* Icon Circle */}
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-orange rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                    {step.number}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow bg-neutral-50 p-6 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-blue/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-blue" />
                        </div>
                        <h3 className="text-xl font-bold text-dark-blue">
                          {step.title}
                        </h3>
                      </div>
                      <span className="text-sm font-semibold text-primary-orange bg-primary-orange/10 px-3 py-1 rounded-full">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-neutral-800">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
