'use client';

import { Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefon',
      content: '0505 705 33 05',
      link: 'tel:+905057053305',
    },
    {
      icon: Mail,
      title: 'E-posta',
      content: 'info@deger360.net',
      link: 'mailto:info@deger360.net',
    },
    {
      icon: MapPin,
      title: 'Konum',
      content: 'Şirinyalı mahallesi, 1501 sokak, no: 9/5, Muratpaşa/ANTALYA',
      link: '#',
    },
  ];

  return (
    <section ref={ref} id="hakkimizda" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Şirket Hikayesi */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-4 sm:mb-6">
              Hakkımızda
            </h2>
            <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-left text-neutral-800 space-y-3 sm:space-y-4">
              <p>
                Değer360 olarak, araç değer kaybı tazminatı konusunda uzmanlaşmış bir danışmanlık firmasıyız. 
                Kaza sonrası mağduriyet yaşayan müşterilerimizin haklarını en etkili şekilde almalarını sağlamak 
                için çalışıyoruz.
              </p>
              <p>
                Ekibimiz, +20 yıllık avukatlık tecrübesi olan deneyimli hukukçular ve ekspertiz uzmanlarından 
                oluşmaktadır. %97 başarı oranımız ve müşteri memnuniyeti odaklı yaklaşımımız ile sektörde 
                güvenilir bir isim olmayı hedefliyoruz.
              </p>
              <p>
                Misyonumuz, kaza sonrası karmaşık hukuki süreçlerde müşterilerimizin yanında olmak ve 
                tüm işlemleri profesyonel ekibimizle yöneterek onların zamanını ve enerjisini korumaktır. 
                Ön ödeme almadan, sadece başarılı sonuçta komisyon alarak çalışıyoruz.
              </p>
              <p>
                Her müşterimizin dosyasını titizlikle inceliyor ve en iyi sonucu almak için çalışıyoruz. 
                Şeffaf süreç yönetimi, hızlı dönüş süreleri ve güvenilir hizmet anlayışımız ile 
                müşterilerimizin haklarını korumak için buradayız.
              </p>
            </div>
          </motion.div>

          {/* İletişim Bilgileri Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
          >
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.a
                  key={index}
                  href={info.link}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="bg-neutral-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary-orange/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-orange/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary-orange" />
                    </div>
                    <h3 className="text-lg font-bold text-dark-blue mb-2">
                      {info.title}
                    </h3>
                    <p className="text-neutral-800">
                      {info.content}
                    </p>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
