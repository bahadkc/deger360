import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda - Değer Kaybı Danışmanlığı',
  description: 'DeğerKaybım hakkında bilgiler, ekibimiz ve misyonumuz.',
};

export default function HakkimizdaPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-dark-blue mb-8">Hakkımızda</h1>
      <p className="text-lg text-neutral-800">Sayfa içeriği yakında eklenecek...</p>
    </div>
  );
}

