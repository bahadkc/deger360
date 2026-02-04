import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ConditionalLayout } from './conditional-layout';
import { ResourceHints } from '@/components/performance/resource-hints';

const inter = Inter({ 
  subsets: ['latin'],
  // Use 'optional' for faster initial render - browser uses fallback if font not ready
  // Falls back to 'swap' if 'optional' causes layout issues
  display: 'optional',
  preload: true,
  variable: '--font-inter',
  // Optimize font loading
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
  // Reduce font file size by only loading necessary weights
  weight: ['400', '500', '600', '700'],
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
    <html lang="tr">
      <head>
        <ResourceHints />
      </head>
      <body className={inter.className}>
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

