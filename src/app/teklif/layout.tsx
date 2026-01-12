import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ücretsiz Değer Kaybı Teklifi Al',
  description: 'Aracınız ne kadar değer kaybetti? Plaka ve araç bilgilerinizi girin, uzmanlarımızdan ücretsiz değer kaybı teklifi ve tazminat raporu alın.',
};

export default function TeklifLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
