import type { Metadata } from 'next';
import { AboutSection } from '@/components/sections/about-section';
import { PageCTASection } from '@/components/sections/page-cta-section';

export const metadata: Metadata = {
  title: 'Hakkımızda & Başarı Oranımız',
  description: '%97 başarı oranı ile araç değer kaybı danışmanlığında lider. Uzman eksper ve hukuk ekibimizle hak ettiğiniz tazminatı almanızı sağlıyoruz.',
};

export default function HakkimizdaPage() {
  return (
    <main>
      <AboutSection />
      <PageCTASection />
    </main>
  );
}

