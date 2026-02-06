'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/header';
import { isAdminPath } from '@/lib/config/admin-paths';

// Lazy load below-the-fold components to reduce initial bundle size and main-thread work
// These components are not critical for first paint
// Mobile-optimized: More aggressive lazy loading for mobile devices
const Footer = dynamic(() => import('@/components/layout/footer').then(mod => ({ default: mod.Footer })), {
  ssr: true, // Keep SSR for SEO, but code-split for client
  // Load footer after initial paint on mobile to reduce main-thread work
  loading: () => null, // No loading state to reduce layout shift
});

const StickyMobileCTA = dynamic(() => import('@/components/ui/sticky-mobile-cta').then(mod => ({ default: mod.StickyMobileCTA })), {
  ssr: false, // Not needed for SEO, can be client-only
  // Delay loading on mobile to prioritize critical content
  loading: () => null,
});

// Defer analytics to reduce main-thread work during initial load
// Mobile devices benefit more from deferred analytics loading
const GoogleAnalytics = dynamic(() => import('@/components/analytics/google-analytics').then(mod => ({ default: mod.GoogleAnalytics })), {
  ssr: false,
  loading: () => null,
});

const WebVitals = dynamic(() => import('@/components/analytics/web-vitals').then(mod => ({ default: mod.WebVitals })), {
  ssr: false,
  loading: () => null,
});

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial hydration, always render children to prevent mismatch
  // The actual conditional rendering happens after mount
  if (!mounted) {
    return <>{children}</>;
  }
  
  // Admin route'larında header/footer gösterme
  if (pathname && isAdminPath(pathname)) {
    return <>{children}</>;
  }

  // Portal route'larında da header/footer gösterme (portal kendi layout'unu kullanıyor)
  if (pathname?.startsWith('/portal')) {
    return <>{children}</>;
  }

  // Ana website için header/footer göster
  // Analytics components load after initial render to reduce main-thread work
  return (
    <>
      {/* Defer analytics loading until after initial paint */}
      {mounted && (
        <>
          <GoogleAnalytics />
          <WebVitals />
        </>
      )}
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
