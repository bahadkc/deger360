'use client';

import { CheckCircle, Clock, Shield, Users, TrendingUp, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const benefits = [
  {
    icon: Clock,
    title: 'Hızlı İşlem',
    description: '2 saat içinde dönüş, 3-6 ay içinde sonuç',
  },
  {
    icon: Shield,
    title: 'Ön Ödeme Yok',
    description: 'Ön ödeme yok, masraflar bize ait',
  },
  {
    icon: Users,
    title: 'Uzman Ekip',
    description: 'Deneyimli avukatlar ve ekspertiz uzmanları',
  },
  {
    icon: TrendingUp,
    title: '%97 Başarı',
    description: 'Müşterilerimizin %97\'si tazminat alıyor',
  },
  {
    icon: Eye,
    title: 'Şeffaf Süreç',
    description: 'Dosyam Nerede? kısmından bütün sürecin ne durumda olduğunu takip edebilirsiniz',
  },
  {
    icon: CheckCircle,
    title: 'A\'dan Z\'ye Hizmet',
    description: 'Tüm süreci biz yönetiyoruz, siz sadece takip edin',
  },
];

export function WhyUsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="neden-biz" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">
            Neden Biz?
          </h2>
          <p className="text-lg text-neutral-800">
            Farkımızı gösteren özelliklerimiz
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-neutral-50 p-6 rounded-xl shadow-md hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-150 ease-out cursor-pointer"
              >
                <div className="w-12 h-12 bg-primary-orange/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-orange" />
                </div>
                <h3 className="text-xl font-bold text-dark-blue mb-2">
                  {benefit.title}
                </h3>
                <p className="text-neutral-800 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
