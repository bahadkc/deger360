'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Sadece ana sayfada çalış
    if (pathname !== '/') return;

    // Hash'i kontrol et
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    // Scroll işlemini yap
    const scrollToSection = () => {
      const element = document.getElementById(hash);
      if (element) {
        const headerHeight = 64; // Header yüksekliği
        const offset = hash === 'iletisim' ? 120 : 80; // İletişim için daha fazla offset
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

    // Kısa bir gecikme ile scroll işlemini yap (sayfa yüklenmesi için)
    setTimeout(() => {
      // İlk deneme
      if (!scrollToSection()) {
        // Element bulunamazsa birkaç kez daha dene (sayfa yüklenmesi için)
        let attempts = 0;
        const maxAttempts = 10;
        const interval = setInterval(() => {
          attempts++;
          if (scrollToSection() || attempts >= maxAttempts) {
            clearInterval(interval);
          }
        }, 100);
      }
    }, 100);
  }, [pathname]);

  return null;
}
