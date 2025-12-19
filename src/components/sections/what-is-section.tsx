'use client';

import { AlertCircle, Shield, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export function WhatIsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">
              Değer Kaybı Nedir?
            </h2>
            <p className="text-lg text-neutral-800">
              Kaza sonrası aracınızın piyasa değeri düşer. Bu farkı tazminat olarak alabilirsiniz.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-neutral-50 p-6 rounded-xl"
            >
              <div className="w-12 h-12 bg-primary-orange/10 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-primary-orange" />
              </div>
              <h3 className="text-xl font-bold text-dark-blue mb-2">
                Sorun
              </h3>
              <p className="text-neutral-800">
                Kaza geçirdiniz, aracınız tamir edildi ama artık eskisi kadar değerli değil.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-neutral-50 p-6 rounded-xl"
            >
              <div className="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary-blue" />
              </div>
              <h3 className="text-xl font-bold text-dark-blue mb-2">
                Çözüm
              </h3>
              <p className="text-neutral-800">
                Değer kaybı tazminatı ile bu farkı karşı tarafın sigortasından alabilirsiniz.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-neutral-50 p-6 rounded-xl"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-dark-blue mb-2">
                Süreç
              </h3>
              <p className="text-neutral-800">
                Bütün süreç Değer360 ekibi tarafından titizlikle yönetilir, size hiçbir zahmet bırakmaz.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
