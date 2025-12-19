'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StickyMobileCTA } from '@/components/ui/sticky-mobile-cta';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Admin route'larında header/footer gösterme
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  // Portal route'larında da header/footer gösterme (portal kendi layout'unu kullanıyor)
  if (pathname?.startsWith('/portal')) {
    return <>{children}</>;
  }

  // Ana website için header/footer göster
  return (
    <>
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
