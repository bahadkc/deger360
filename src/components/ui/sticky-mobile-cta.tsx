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
    // Cache the hero section element to avoid repeated DOM queries
    let heroSection: HTMLElement | null = null;
    // Cache visibility state to avoid unnecessary state updates
    let lastVisibilityState = false;

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(() => {
          // Cache element lookup to avoid repeated DOM queries
          if (!heroSection) {
            heroSection = document.getElementById('contact-form');
          }
          
          if (!heroSection) {
            // Hero section bulunamazsa butonu göster
            if (!lastVisibilityState) {
              setIsVisible(true);
              lastVisibilityState = true;
            }
            ticking = false;
            return;
          }

          // Batch layout read: getBoundingClientRect() is called once per frame
          // This is acceptable as it's already inside requestAnimationFrame
          // However, we optimize by caching the result and only updating state when it changes
          const heroSectionBottom = heroSection.getBoundingClientRect().bottom;
          const shouldBeVisible = heroSectionBottom < 0;
          
          // Only update state if visibility changed to avoid unnecessary re-renders
          if (shouldBeVisible !== lastVisibilityState) {
            setIsVisible(shouldBeVisible);
            lastVisibilityState = shouldBeVisible;
          }
          
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

