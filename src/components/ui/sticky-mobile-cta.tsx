'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hero section'ı (contact-form) bul
      const heroSection = document.getElementById('contact-form');
      
      if (!heroSection) {
        // Hero section bulunamazsa butonu göster
        setIsVisible(true);
        return;
      }

      // Hero section'ın alt pozisyonunu al
      const heroSectionBottom = heroSection.getBoundingClientRect().bottom;
      
      // Eğer hero section tamamen geçildiyse butonu göster
      setIsVisible(heroSectionBottom < 0);
    };

    // İlk kontrol
    handleScroll();

    // Scroll event listener ekle
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  if (!isVisible) {
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

