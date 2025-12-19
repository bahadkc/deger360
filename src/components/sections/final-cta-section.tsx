'use client';

import { Calculator, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const scrollToForm = () => {
    document.getElementById('contact-form')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">
              Ücretsiz Değer Kaybınızı Hesaplayın
            </h2>
            <p className="text-xl mb-8 text-neutral-800">
              Sadece birkaç bilgi ile başlayın. Uzman ekibimiz sizinle iletişime geçsin.
            </p>
            <button
              onClick={scrollToForm}
              className="group bg-primary-orange hover:bg-primary-orange-hover text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <Calculator className="w-5 h-5" />
              Ücretsiz Değer Kaybı Hesapla
              <motion.span
                className="inline-block"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </button>
            <p className="mt-6 text-sm text-neutral-600">
              Ücretsiz • Hızlı • Güvenli
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
