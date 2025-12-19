import type { Metadata } from 'next';
import { ContactFormSection } from '@/components/sections/contact-form-section';

export const metadata: Metadata = {
  title: 'İletişim - Değer Kaybı Danışmanlığı',
  description: 'Bizimle iletişime geçin. Değer kaybı tazminatı için ücretsiz değerlendirme.',
};

export default function IletisimPage() {
  return (
    <div className="py-20">
      <ContactFormSection />
    </div>
  );
}

