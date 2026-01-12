import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teşekkürler',
  description: 'Başvurunuz alındı. Ekibimiz en geç 2 saat içinde sizinle iletişime geçecektir.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
