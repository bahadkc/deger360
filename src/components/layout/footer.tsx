'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const scrollToSection = (sectionId: string | null) => {
    if (!sectionId) {
      window.location.href = '/';
      return;
    }
    
    // Ana sayfadaysak direkt scroll et
    if (window.location.pathname === '/') {
      // Element'i bulmak için birkaç kez deneme yap (animasyon gecikmesi için)
      let attempts = 0;
      const maxAttempts = 10;
      
      const tryScroll = () => {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerHeight = 64; // Header yüksekliği (h-16 = 64px)
          const offset = sectionId === 'iletisim' ? 120 : 80; // İletişim için daha fazla offset
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerHeight - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          return true;
        }
        return false;
      };
      
      // İlk deneme
      if (!tryScroll()) {
        // Element bulunamazsa birkaç kez daha dene
        const interval = setInterval(() => {
          attempts++;
          if (tryScroll() || attempts >= maxAttempts) {
            clearInterval(interval);
          }
        }, 100);
      }
    } else {
      // Başka sayfadaysak ana sayfaya yönlendir
      window.location.href = '/#' + sectionId;
    }
  };

  return (
    <footer className="bg-dark-blue text-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Firma Bilgisi */}
          <div>
            <Image
              src="/images/logo.png"
              alt="Değer360 - Araç Değer Kaybı Tazminatı Danışmanlığı Logo"
              width={150}
              height={50}
              className="h-10 w-auto mb-4"
              loading="lazy"
            />
            <p className="text-neutral-200">
              Aracınızın değer kaybı tazminatını almak için yanınızdayız. Profesyonel ekibimizle haklarınızı koruyoruz.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="font-bold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection('contact-form')}
                  className="text-neutral-200 hover:text-primary-orange transition-colors"
                >
                  Değer Kaybı Hesaplama
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('nedir')}
                  className="text-neutral-200 hover:text-primary-orange transition-colors"
                >
                  Değer Kaybı Nedir?
                </button>
              </li>
              <li>
                {isHomePage ? (
                  <button 
                    onClick={() => scrollToSection('surec')}
                    className="text-neutral-200 hover:text-primary-orange transition-colors"
                  >
                    Süreç
                  </button>
                ) : (
                  <Link 
                    href="/#surec"
                    className="text-neutral-200 hover:text-primary-orange transition-colors"
                  >
                    Süreç
                  </Link>
                )}
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('neden-biz')}
                  className="text-neutral-200 hover:text-primary-orange transition-colors"
                >
                  Neden Biz?
                </button>
              </li>
              <li>
                {isHomePage ? (
                  <button 
                    onClick={() => scrollToSection('hakkimizda')}
                    className="text-neutral-200 hover:text-primary-orange transition-colors"
                  >
                    Hakkımızda
                  </button>
                ) : (
                  <Link 
                    href="/#hakkimizda"
                    className="text-neutral-200 hover:text-primary-orange transition-colors"
                  >
                    Hakkımızda
                  </Link>
                )}
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('iletisim')}
                  className="text-neutral-200 hover:text-primary-orange transition-colors"
                >
                  İletişim
                </button>
              </li>
              <li>
                {isHomePage ? (
                  <button 
                    onClick={() => scrollToSection('sss')}
                    className="text-neutral-200 hover:text-primary-orange transition-colors"
                  >
                    SSS
                  </button>
                ) : (
                  <Link 
                    href="/#sss"
                    className="text-neutral-200 hover:text-primary-orange transition-colors"
                  >
                    SSS
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Yasal */}
          <div>
            <h4 className="font-bold mb-4">Yasal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/kvkk" className="text-neutral-200 hover:text-primary-orange transition-colors">
                  KVKK
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="text-neutral-200 hover:text-primary-orange transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/kullanim-kosullari" className="text-neutral-200 hover:text-primary-orange transition-colors">
                  Kullanım Koşulları
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="font-bold mb-4">İletişim</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <a href="tel:+905057053305" className="hover:text-primary-orange transition-colors">
                    0505 705 33 05
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <a href="mailto:info@deger360.net" className="hover:text-primary-orange transition-colors">
                    info@deger360.net
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <div className="text-neutral-200">
                  Şirinyalı mahallesi, 1501 sokak, no: 9/5, Muratpaşa/ANTALYA
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-neutral-200">
          <p className="mb-2">© 2024 Değer360 - Tüm Hakları Saklıdır.</p>
          <p className="text-sm">Değer360, araç değer kaybı süreçlerinde uzmanlaşmış bir danışmanlık firmasıdır.</p>
        </div>
      </div>
    </footer>
  );
}
