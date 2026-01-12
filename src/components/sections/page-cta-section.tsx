'use client';

import Link from 'next/link';
import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react';

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

export function PageCTASection() {
  return (
    <section className="pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 bg-gradient-to-b from-white to-neutral-50">
      {/* Geçiş Divider */}
      <div className="container mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-6 py-2 text-neutral-600 text-sm font-medium rounded-full border border-neutral-200">
                Daha Fazla Bilgi
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* CTA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Ana Sayfaya Yönlendirme */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-primary-orange/20 hover:border-primary-orange/40 transition-all">
              <h3 className="text-2xl font-bold text-dark-blue mb-4">
                Daha Fazla Bilgi Alın
              </h3>
              <p className="text-neutral-700 mb-6">
                Ana sayfamızda tüm hizmetlerimizi, sürecimizi ve başarı hikayelerimizi detaylıca anlattık. 
                Hemen keşfedin!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary-orange hover:bg-primary-orange-hover text-white font-bold px-6 py-3 rounded-lg transition-colors"
              >
                Ana Sayfaya Git
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Bize Ulaşın */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-primary-blue/20 hover:border-primary-blue/40 transition-all">
              <h3 className="text-2xl font-bold text-dark-blue mb-4">
                Bize Ulaşın
              </h3>
              <p className="text-neutral-700 mb-6">
                Değer kaybı tazminatı için ücretsiz değerlendirme alın. Formu doldurun, 
                2 saat içinde size dönüş yapalım.
              </p>
              <Link
                href="/teklif"
                className="inline-flex items-center gap-2 bg-primary-blue hover:bg-primary-blue/90 text-white font-bold px-6 py-3 rounded-lg transition-colors"
              >
                Teklif Al
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* İletişim Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <a
                  key={index}
                  href={info.link}
                  className="bg-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 group border border-neutral-200"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary-orange/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-orange/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary-orange" />
                    </div>
                    <h4 className="text-lg font-bold text-dark-blue mb-2">
                      {info.title}
                    </h4>
                    <p className="text-neutral-800 text-sm">
                      {info.content}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
