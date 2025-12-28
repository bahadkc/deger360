'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StickyMobileCTA } from '@/components/ui/sticky-mobile-cta';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { WebVitals } from '@/components/analytics/web-vitals';
import { isAdminPath } from '@/lib/config/admin-paths';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
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
