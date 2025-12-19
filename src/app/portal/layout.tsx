import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Müşteri Portalı - Değer Kaybı Danışmanlığı',
  description: 'Dosyanızın durumunu takip edin, belgelerinizi yönetin ve avukatınızla iletişime geçin',
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Portal sayfaları için layout
  // Ana sayfanın header/footer'ını CSS ile gizliyoruz (globals.css)
  return <>{children}</>;
}
