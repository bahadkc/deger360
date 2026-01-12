import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deger360.net';

export const metadata: Metadata = {
  title: 'Müşteri Paneli Girişi | Dosyam Nerede',
  description: 'Değer360 müşteri paneline giriş yapın. Dosya takip numaranızla tazminat sürecinizi, evraklarınızı ve başvuru durumunuzu anlık sorgulayın.',
  openGraph: {
    title: 'Müşteri Paneli Girişi | Dosyam Nerede | Değer360',
    description: 'Değer360 müşteri paneline giriş yapın. Dosya takip numaranızla tazminat sürecinizi, evraklarınızı ve başvuru durumunuzu anlık sorgulayın.',
    url: `${siteUrl}/portal/giris`,
    siteName: 'Değer360',
    images: [
      {
        url: `${siteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Değer360 Müşteri Portalı',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Müşteri Paneli Girişi | Dosyam Nerede | Değer360',
    description: 'Değer360 müşteri paneline giriş yapın. Dosya takip numaranızla tazminat sürecinizi, evraklarınızı ve başvuru durumunuzu anlık sorgulayın.',
    images: [`${siteUrl}/images/og-image.png`],
  },
};

export default function GirisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login sayfasında normal header/footer gösterilmez
  return <>{children}</>;
}
