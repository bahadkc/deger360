// Server Component - SEO dostu, içerik sunucuda render edilir
import { Phone, Mail, MapPin } from 'lucide-react';
import { ScrollAnimation } from '@/components/ui/scroll-animation';

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

export function AboutSection() {
  return (
    <section id="hakkimizda" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Şirket Hikayesi */}
          <ScrollAnimation>
            <div className="text-center mb-8 sm:mb-12">
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
            </div>
          </ScrollAnimation>

          {/* İletişim Bilgileri Cards */}
          <ScrollAnimation id="iletisim" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <a
                    key={index}
                    href={info.link}
                    className="bg-neutral-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300 group w-full block h-full flex flex-col"
                  >
                    <div className="flex flex-col items-center text-center flex-grow">
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
                  </a>
                );
              })}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
