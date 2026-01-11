// Server Component - SEO dostu, içerik sunucuda render edilir
import { FileText, Search, Send, MessageCircle, Scale, CheckCircle } from 'lucide-react';
import { ScrollAnimation } from '@/components/ui/scroll-animation';

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
    description: 'Süreç sonunda hak ediş tutarınız hesabınıza gönderilir.',
    duration: 'Sonuç',
    icon: CheckCircle,
  },
];

export function ProcessSection() {
  return (
    <section id="surec" className="py-12 sm:py-16 md:py-20 bg-white">
      <ScrollAnimation>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-3 sm:mb-4">
              Süreç Nasıl İşliyor?
            </h2>
            <p className="text-base sm:text-lg text-neutral-800 px-2">
              Tüm süreci biz yönetiyoruz, siz sadece takip edin
            </p>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative pl-6 sm:pl-8 pb-8 sm:pb-12 last:pb-0">
                  {/* Vertical Line */}
                  {index !== steps.length - 1 && (
                    <div className="absolute left-[11px] sm:left-[15px] top-10 sm:top-12 bottom-0 w-0.5 bg-primary-blue/20" />
                  )}
                  {/* Step */}
                  <div className="flex gap-3 sm:gap-6">
                    {/* Icon Circle */}
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-primary-orange rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm z-10">
                      {step.number}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-grow bg-neutral-50 p-4 sm:p-6 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-blue" />
                          </div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-dark-blue">
                            {step.title}
                          </h3>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-primary-orange bg-primary-orange/10 px-2 sm:px-3 py-1 rounded-full self-start sm:self-auto">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-neutral-800">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollAnimation>
    </section>
  );
}
