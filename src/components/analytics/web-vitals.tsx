'use client';

import { useEffect } from 'react';
import { trackWebVitals } from '@/lib/analytics';

export function WebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only track in production
    if (process.env.NODE_ENV !== 'production') return;

    // Import and track web vitals
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(trackWebVitals);
      onFID(trackWebVitals);
      onFCP(trackWebVitals);
      onLCP(trackWebVitals);
      onTTFB(trackWebVitals);
    }).catch((error) => {
      // Silently fail if web-vitals is not available or fails to load
      if (process.env.NODE_ENV === 'development') {
        console.log('Web Vitals tracking not available:', error);
      }
    });
  }, []);

  return null;
}

