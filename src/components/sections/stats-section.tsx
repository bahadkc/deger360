// Server Component - SEO dostu, içerik sunucuda render edilir
import { FileCheck, Percent, Shield, Clock } from 'lucide-react';
import { ScrollAnimation } from '@/components/ui/scroll-animation';

const stats = [
  {
    icon: FileCheck,
    value: '+750',
    label: 'Başarılı Dava',
    description: 'Geçtiğimiz yılda kazandığımız davalar',
  },
  {
    icon: Percent,
    value: '%97',
    label: 'Kazanma Oranı',
    description: 'Müşterilerimizin %97\'si tazminat aldı',
  },
  {
    icon: Shield,
    value: '0TL',
    label: 'Maliyet',
    description: 'Ön ödeme yok, masraflar bize ait. Sadece tazminat alındıktan sonra ödeme alıyoruz.',
  },
  {
    icon: Clock,
    value: '3-6 Ay',
    label: 'Ortalama Süre',
    description: 'Dosyalar bu sürede sonuçlanıyor',
  },
];

export function StatsSection() {
  return (
    <section id="hizmetlerimiz" className="py-12 sm:py-16 md:py-20 bg-white">
      <ScrollAnimation>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-3 sm:mb-4">
              Rakamlar Konuşuyor
            </h2>
            <p className="text-base sm:text-lg text-neutral-800 px-2">
              Geçtiğimiz yıllardaki başarı oranlarımız, verilerimiz ve sonuçlarımız
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-neutral-50 p-6 rounded-xl hover:shadow-lg transition-shadow h-full flex flex-col">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary-orange/10 rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-primary-orange" />
                  </div>
                  <div className="text-3xl font-bold text-dark-blue mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-neutral-800 mb-2">
                    {stat.label}
                  </div>
                  <p className="text-sm text-neutral-600 flex-grow">
                    {stat.description}
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
