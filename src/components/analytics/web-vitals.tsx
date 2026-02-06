'use client';

import { useEffect } from 'react';
import { trackWebVitals } from '@/lib/analytics';

export function WebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only track in production
    if (process.env.NODE_ENV !== 'production') return;

    // Use requestIdleCallback to defer web vitals tracking until browser is idle
    // This reduces main-thread work during critical page load phase
    const loadWebVitals = () => {
      import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB }) => {
        onCLS(trackWebVitals);
        onFCP(trackWebVitals);
        onLCP(trackWebVitals);
        onTTFB(trackWebVitals);
      }).catch((error) => {
        // Silently fail if web-vitals is not available or fails to load
        if (process.env.NODE_ENV === 'development') {
          console.log('Web Vitals tracking not available:', error);
        }
      });
    };

    // Defer loading until browser is idle to minimize main-thread work
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadWebVitals, { timeout: 5000 });
    } else {
      // Fallback: delay by 2 seconds to allow critical rendering to complete
      setTimeout(loadWebVitals, 2000);
    }
  }, []);

  return null;
}

