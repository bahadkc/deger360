import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giriş - Dosyam Nerede | Değer Kaybı Danışmanlığı',
  description: 'Dosya takip numaranız ve şifrenizle giriş yaparak dosyanızın durumunu takip edin',
};

export default function GirisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login sayfasında normal header/footer gösterilmez
  return <>{children}</>;
}
