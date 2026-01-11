// Server Component - SEO dostu, içerik sunucuda render edilir
import { CheckCircle, Clock, Shield, Users, TrendingUp, Eye } from 'lucide-react';
import { ScrollAnimation } from '@/components/ui/scroll-animation';

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
  return (
    <section id="neden-biz" className="py-12 sm:py-16 md:py-20 bg-white">
      <ScrollAnimation>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-3 sm:mb-4">
              Neden Biz?
            </h2>
            <p className="text-base sm:text-lg text-neutral-800 px-2">
              Farkımızı gösteren özelliklerimiz
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-neutral-50 p-6 rounded-xl shadow-md hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-150 ease-out cursor-pointer h-full flex flex-col">
                  <div className="w-12 h-12 bg-primary-orange/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-orange" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-blue mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-800 leading-relaxed flex-grow">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollAnimation>
    </section>
  );
}
