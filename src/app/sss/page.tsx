import type { Metadata } from 'next';
import { FAQSection } from '@/components/sections/faq-section';

export const metadata: Metadata = {
  title: 'SSS - Sıkça Sorulan Sorular',
  description: 'Değer kaybı tazminatı hakkında sıkça sorulan sorular ve cevapları.',
};

export default function SSSPage() {
  return (
    <div className="py-20">
      <FAQSection />
    </div>
  );
}

