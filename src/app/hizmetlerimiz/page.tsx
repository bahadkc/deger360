import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hizmetlerimiz - Araç Değer Kaybı Danışmanlığı',
  description: 'Araç değer kaybı tazminatı için sunduğumuz hizmetler: Ekspertiz, avukatlık, sigorta müzakereleri ve dava takibi.',
};

export default function HizmetlerimizPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-dark-blue mb-8">Hizmetlerimiz</h1>
      <p className="text-lg text-neutral-800">Sayfa içeriği yakında eklenecek...</p>
    </div>
  );
}

