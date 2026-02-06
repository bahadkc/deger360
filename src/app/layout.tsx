import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ConditionalLayout } from './conditional-layout';
import { ResourceHints } from '@/components/performance/resource-hints';

const inter = Inter({ 
  subsets: ['latin'],
  // Use 'swap' to ensure text is immediately visible while font loads (prevents render blocking)
  display: 'swap',
  // Enable preload for critical font weights to reduce request chain length
  // Preloading fonts allows them to download in parallel with CSS, not after
  preload: true,
  variable: '--font-inter',
  // Optimize font loading
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
  // Mobile-first font loading: Only load essential weights initially
  // Mobile devices benefit from fewer font files = faster load times
  // Load only 400 (body) and 600 (headings) initially, others can load later
  weight: ['400', '600'],
  // Note: Additional weights (500, 700) can be loaded on-demand if needed
  // This reduces initial font file size by ~50% on mobile
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deger360.net';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'Değer360 - Araç Değer Kaybı Danışmanlığı',
    template: '%s | Değer360',
  },
  description: 'Kaza yaptınız ama aracınız değerini kayıp mı etti? Değer360 ile aracınızın kaza sonrası değer kaybını tazminat olarak alabilirsiniz. Ücretsiz değer kaybınızı hesaplayın, uzman ekibimiz bütün süreci sizin için yönetsin.',
  keywords: ['araç değer kaybı', 'trafik kazası tazminatı', 'değer kaybı davası', 'sigorta tazminatı', 'araç hasar tazminatı'],
  authors: [{ name: 'Değer360' }],
  creator: 'Değer360',
  publisher: 'Değer360',
  icons: {
    icon: `https://deger360.net/icon.png`,
    apple: `https://deger360.net/icon.png`,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteUrl,
    siteName: 'Değer360',
    title: 'Değer360 - Araç Değer Kaybı Danışmanlığı',
    description: 'Kaza yaptınız ama aracınız değerini kayıp mı etti? Değer360 ile aracınızın kaza sonrası değer kaybını tazminat olarak alabilirsiniz. Ücretsiz değer kaybınızı hesaplayın, uzman ekibimiz bütün süreci sizin için yönetsin.',
    images: [
      {
        url: `${siteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Değer360',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Değer360 - Araç Değer Kaybı Danışmanlığı',
    description: 'Kaza yaptınız ama aracınız değerini kayıp mı etti? Değer360 ile aracınızın kaza sonrası değer kaybını tazminat olarak alabilirsiniz. Ücretsiz değer kaybınızı hesaplayın, uzman ekibimiz bütün süreci sizin için yönetsin.',
    images: [`${siteUrl}/images/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'WLgdALt7k_eZUvPVp39P7_K7xVWldTNAP_9gQFOHFZo',
    yandex: '0966b47c943bf287',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="tr" className={inter.variable}>
      <head>
        <ResourceHints />
        {/* Critical CSS - Inlined to prevent render blocking */}
        {/* Mobile-optimized: Minimal CSS for first paint, rest loads asynchronously */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS - Above the fold styles only - Mobile-first */
            *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
            html{scroll-behavior:smooth;overflow-y:scroll;-webkit-text-size-adjust:100%}
            body{font-family:var(--font-inter),system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-x:hidden;text-rendering:optimizeSpeed}
            header{position:fixed;top:0;left:0;right:0;background-color:#fff;z-index:50;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06);isolation:isolate}
            main{padding-top:4rem;contain:layout style}
            .container{width:100%;margin-left:auto;margin-right:auto;padding-left:1rem;padding-right:1rem}
            @media(min-width:640px){.container{padding-left:1.5rem;padding-right:1.5rem}}
            @media(min-width:1024px){.container{max-width:1024px}}
            @media(min-width:1280px){.container{max-width:1280px}}
            /* Mobile optimizations */
            @media(max-width:768px){img{height:auto;max-width:100%}*{-webkit-tap-highlight-color:transparent}}
          `
        }} />
      </head>
      <body>
        {/* Google Tag Manager - Optimized to prevent forced reflows and reduce unused JS */}
        {/* Load GTM with lazyOnload to defer loading and reduce unused JavaScript */}
        <Script
          id="google-tag-manager"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
                // Use requestIdleCallback to defer DOM queries and prevent forced reflows
                if (window.requestIdleCallback) {
                  requestIdleCallback(function() {
                    var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                    j.async=true;
                    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                    f.parentNode.insertBefore(j,f);
                  }, { timeout: 2000 });
                } else {
                  // Fallback for browsers without requestIdleCallback
                  setTimeout(function() {
                    var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                    j.async=true;
                    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                    f.parentNode.insertBefore(j,f);
                  }, 1);
                }
              })(window,document,'script','dataLayer','GTM-NLXPVM2R');
            `,
          }}
        />
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-NLXPVM2R"
            height="0" 
            width="0" 
            style={{display:'none',visibility:'hidden'}}
          />
        </noscript>
        {/* Note: Google Analytics is loaded via GoogleAnalytics component in ConditionalLayout */}
        {/* Schema.org Structured Data */}
        <Script
          id="schema-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "url": siteUrl,
                  "name": "Değer360",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": `${siteUrl}/search?q={search_term_string}`
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Teklif Al",
                  "url": `${siteUrl}/teklif`
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Süreç",
                  "url": `${siteUrl}/surec`
                },
                {
                  "@type": "SiteNavigationElement",
                  "name": "Sıkça Sorulan Sorular",
                  "url": `${siteUrl}/sss`
                }
              ]
            })
          }}
        />
        {/* Organization Schema Markup */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Değer360",
              "url": siteUrl,
              "logo": `${siteUrl}/icon.png`,
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+90 505 705 33 05",
                "contactType": "customer service",
                "areaServed": "TR",
                "availableLanguage": "Turkish"
              }
            })
          }}
        />
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}

