import type { Metadata } from 'next';
import { ContactFormSection } from '@/components/sections/contact-form-section';
import { Phone, Mail, MapPin } from 'lucide-react';

const contactInfo = [
  {
    icon: Phone,
    title: 'Telefon',
    content: '+90 505 705 33 05',
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

export const metadata: Metadata = {
  title: 'İletişim & Bize Ulaşın',
  description: 'Değer kaybı başvurusu için bizimle iletişime geçin. WhatsApp hattımız, adres bilgilerimiz ve iletişim formu. 2 saat içinde dönüş garantisi.',
};

export default function IletisimPage() {
  return (
    <main className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-4 sm:mb-6 md:mb-8 text-center">
          İletişim
        </h1>
        <p className="text-base sm:text-lg text-neutral-800 text-center max-w-2xl mx-auto mb-8">
          Değer kaybı tazminatı için ücretsiz değerlendirme alın. Formu doldurun, 2 saat içinde size dönüş yapalım.
        </p>
        
        {/* İletişim Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-12">
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
                  <h3 className="text-lg font-bold text-dark-blue mb-2">
                    {info.title}
                  </h3>
                  <p className="text-neutral-800 text-sm">
                    {info.content}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
      <ContactFormSection />
    </main>
  );
}

