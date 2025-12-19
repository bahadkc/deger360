'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-dark-blue text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Firma Bilgisi */}
          <div>
            <Image
              src="/images/logo.png"
              alt="Değer360 Logo"
              width={150}
              height={50}
              className="h-10 w-auto mb-4"
            />
            <p className="text-neutral-200 mb-4">
              Aracınızın değer kaybı tazminatını almak için yanınızdayız. Profesyonel ekibimizle haklarınızı koruyoruz.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary-orange transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-orange transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-orange transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="font-bold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection('hizmetlerimiz')}
                  className="text-neutral-200 hover:text-primary-orange transition-colors"
                >
                  Rakamlar
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('surec')}
                  className="text-neutral-200 hover:text-primary-orange transition-colors"
                >
                  Süreç
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('hakkimizda')}
                  className="text-neutral-200 hover:text-primary-orange transition-colors"
                >
                  Hakkımızda
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('sss')}
                  className="text-neutral-200 hover:text-primary-orange transition-colors"
                >
                  SSS
                </button>
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
                  <a href="tel:+905497321900" className="hover:text-primary-orange transition-colors">
                    0549 732 19 00
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
                  Antalya, Türkiye
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-neutral-200">
          <p>© 2024 Değer360. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
