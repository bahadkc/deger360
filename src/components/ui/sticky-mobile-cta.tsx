'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function StickyMobileCTA() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Teklif sayfasında butonu gösterme
    if (pathname === '/teklif') {
      setIsVisible(false);
      return;
    }

    let ticking = false;
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          // Hero section'ı (contact-form) bul
          const heroSection = document.getElementById('contact-form');
          
          if (!heroSection) {
            // Hero section bulunamazsa butonu göster
            setIsVisible(true);
            ticking = false;
            return;
          }

          // Hero section'ın alt pozisyonunu al (requestAnimationFrame içinde)
          const heroSectionBottom = heroSection.getBoundingClientRect().bottom;
          
          // Eğer hero section tamamen geçildiyse butonu göster
          setIsVisible(heroSectionBottom < 0);
          ticking = false;
        });
      }
    };

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        handleScroll();
      }, 150);
    };

    // İlk kontrol
    handleScroll();

    // Scroll event listener ekle
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      clearTimeout(resizeTimeout);
    };
  }, [pathname]);

  // Teklif sayfasında veya görünür değilse butonu gösterme
  if (pathname === '/teklif' || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 lg:hidden z-40 border-t-2 border-neutral-200 transition-all duration-300">
      <Link
        href="/teklif"
        className="w-full bg-primary-orange hover:bg-primary-orange-hover text-white font-bold py-3 rounded-lg shadow-lg inline-block text-center"
      >
        Hemen Başvur
      </Link>
    </div>
  );
}

