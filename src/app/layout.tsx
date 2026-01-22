import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ConditionalLayout } from './conditional-layout';

const inter = Inter({ subsets: ['latin'] });

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
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {/* Google tag (gtag.js) - Script component automatically adds to head */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DW3NXFD2DY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DW3NXFD2DY');
          `}
        </Script>
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
                "telephone": "+90-505-705-3305",
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

