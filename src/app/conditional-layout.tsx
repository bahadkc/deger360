'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StickyMobileCTA } from '@/components/ui/sticky-mobile-cta';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { WebVitals } from '@/components/analytics/web-vitals';
import { isAdminPath } from '@/lib/config/admin-paths';

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
  return (
    <>
      <GoogleAnalytics />
      <WebVitals />
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
