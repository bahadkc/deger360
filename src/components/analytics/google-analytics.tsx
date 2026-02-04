'use client';

import Script from 'next/script';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

function GoogleAnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    if (gaId && pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams, gaId]);

  if (!gaId) {
    return null;
  }

  return (
    <>
      {/* Initialize dataLayer early to prevent errors */}
      <Script
        id="google-analytics-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            // Defer gtag config to prevent forced reflows
            if (window.requestIdleCallback) {
              requestIdleCallback(function() {
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              }, { timeout: 2000 });
            } else {
              setTimeout(function() {
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              }, 100);
            }
          `,
        }}
      />
      {/* Load gtag.js with lazyOnload to prevent forced reflows */}
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
    </>
  );
}

export function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </Suspense>
  );
}

