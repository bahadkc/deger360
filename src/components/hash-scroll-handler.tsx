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

    // Optimized scroll function that avoids forced reflows
    const performScroll = () => {
      const element = document.getElementById(hash);
      if (!element) return false;
      
      // Use scrollIntoView with CSS scroll-margin instead of manual calculations
      // This avoids reading getBoundingClientRect() which forces layout recalculation
      const headerHeight = 64; // Header yüksekliği
      const offset = hash === 'iletisim' ? 120 : 80; // İletişim için daha fazla offset
      
      // Set scroll-margin-top temporarily to account for header and offset
      const originalScrollMargin = element.style.scrollMarginTop;
      element.style.scrollMarginTop = `${headerHeight + offset}px`;
      
      // Use scrollIntoView which is optimized by the browser and doesn't force reflow
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      
      // Restore original scroll-margin after a delay
      setTimeout(() => {
        element.style.scrollMarginTop = originalScrollMargin;
      }, 1000);
      
      return true;
    };

    // Use requestIdleCallback to avoid blocking initial page render
    // This prevents forced reflows during page load
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          if (!performScroll()) {
            // Element not found, try again after a short delay
            let attempts = 0;
            const maxAttempts = 10;
            const interval = setInterval(() => {
              attempts++;
              if (performScroll() || attempts >= maxAttempts) {
                clearInterval(interval);
              }
            }, 100);
          }
        }, 100);
      }, { timeout: 500 });
    } else {
      // Fallback: use requestAnimationFrame
      setTimeout(() => {
        requestAnimationFrame(() => {
          if (!performScroll()) {
            let attempts = 0;
            const maxAttempts = 10;
            const interval = setInterval(() => {
              attempts++;
              if (performScroll() || attempts >= maxAttempts) {
                clearInterval(interval);
              }
            }, 100);
          }
        });
      }, 100);
    }
  }, [pathname]);

  return null;
}
