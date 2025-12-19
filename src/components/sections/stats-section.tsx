'use client';

import { FileCheck, Percent, Banknote, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const stats = [
  {
    icon: FileCheck,
    value: '+250',
    label: 'Başarılı Dava',
    description: 'Geçtiğimiz yılda kazandığımız davalar',
  },
  {
    icon: Percent,
    value: '%92',
    label: 'Kazanma Oranı',
    description: 'Müşterilerimizin %92\'si tazminat aldı',
  },
  {
    icon: Banknote,
    value: '45.000 TL',
    label: 'Ortalama Tazminat',
    description: 'Müşterilerimiz ortalama bu tutarı alıyor',
  },
  {
    icon: Clock,
    value: '3-6 Ay',
    label: 'Ortalama Süre',
    description: 'Dosyalar bu sürede sonuçlanıyor',
  },
];

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="hizmetlerimiz" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">
            Rakamlar Konuşuyor
          </h2>
          <p className="text-lg text-neutral-800">
            Geçtiğimiz yıllardaki başarı oranlarımız, verilerimiz ve sonuçlarımız
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-neutral-50 p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-primary-orange/10 rounded-lg mb-4">
                  <Icon className="w-6 h-6 text-primary-orange" />
                </div>
                <div className="text-3xl font-bold text-dark-blue mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-neutral-800 mb-2">
                  {stat.label}
                </div>
                <p className="text-sm text-neutral-600">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
