import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConditionalLayout } from './conditional-layout';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'DeğerKaybım - Araç Değer Kaybı Tazminatı Danışmanlığı',
    template: '%s | DeğerKaybım',
  },
  description: 'Kaza sonrası aracınızın değer kaybı tazminatını almak için tüm süreci yönetiyoruz. Ön ödeme yok, %92 başarı oranı. Ücretsiz hesaplama yapın ve hemen başvurun!',
  keywords: ['araç değer kaybı', 'trafik kazası tazminatı', 'değer kaybı davası', 'sigorta tazminatı', 'araç hasar tazminatı'],
  authors: [{ name: 'DeğerKaybım' }],
  creator: 'DeğerKaybım',
  publisher: 'DeğerKaybım',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteUrl,
    siteName: 'DeğerKaybım',
    title: 'DeğerKaybım - Araç Değer Kaybı Tazminatı Danışmanlığı',
    description: 'Kaza sonrası aracınızın değer kaybı tazminatını almak için tüm süreci yönetiyoruz. Ön ödeme yok, %92 başarı oranı.',
    images: [
      {
        url: `${siteUrl}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: 'DeğerKaybım Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeğerKaybım - Araç Değer Kaybı Tazminatı Danışmanlığı',
    description: 'Kaza sonrası aracınızın değer kaybı tazminatını almak için tüm süreci yönetiyoruz.',
    images: [`${siteUrl}/images/logo.png`],
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
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}

