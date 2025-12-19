import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConditionalLayout } from './conditional-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DeğerKaybım - Araç Değer Kaybı Tazminatı Danışmanlığı',
  description: 'Kaza sonrası aracınızın değer kaybı tazminatını almak için tüm süreci yönetiyoruz. Ön ödeme yok, %92 başarı oranı.',
  keywords: 'araç değer kaybı, trafik kazası tazminatı, değer kaybı davası, sigorta tazminatı',
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

