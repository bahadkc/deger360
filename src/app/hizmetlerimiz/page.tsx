import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hizmetlerimiz - Araç Değer Kaybı Danışmanlığı',
  description: 'Araç değer kaybı tazminatı için sunduğumuz hizmetler: Ekspertiz, avukatlık, sigorta müzakereleri ve dava takibi. Ücretsiz değerlendirme için hemen başvurun!',
};

export default function HizmetlerimizPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-4 sm:mb-6 md:mb-8">Hizmetlerimiz</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-blue mb-4">Ekspertiz ve Değer Kaybı Hesaplama</h2>
          <p className="text-base sm:text-lg text-neutral-800 mb-4">
            Profesyonel ekspertiz ekibimiz, aracınızın kaza öncesi ve sonrası değerini detaylı bir şekilde hesaplar. 
            Bilirkişi raporları ile sigorta şirketlerine sunacağımız güçlü deliller hazırlarız.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-blue mb-4">Hukuki Danışmanlık ve Avukatlık Hizmetleri</h2>
          <p className="text-base sm:text-lg text-neutral-800 mb-4">
            Deneyimli avukatlarımız, tazminat sürecinizin her aşamasında yanınızda. Sigorta müzakerelerinden 
            dava sürecine kadar tüm hukuki işlemleri sizin için yürütüyoruz.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-blue mb-4">Sigorta Müzakereleri</h2>
          <p className="text-base sm:text-lg text-neutral-800 mb-4">
            Karşı tarafın sigorta şirketi ile profesyonel müzakereler gerçekleştiriyoruz. 
            Hak ettiğiniz tazminatı en kısa sürede almanız için çalışıyoruz.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-blue mb-4">Dava ve İcra Takibi</h2>
          <p className="text-base sm:text-lg text-neutral-800 mb-4">
            Gerekli durumlarda dava açıyor ve icra takibini yapıyoruz. Tüm süreç boyunca 
            sizi bilgilendiriyor ve haklarınızı koruyoruz.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-blue mb-4">Evrak Toplama ve Süreç Yönetimi</h2>
          <p className="text-base sm:text-lg text-neutral-800 mb-4">
            Gerekli tüm evrakları sizin için topluyoruz. Kaza tutanağı, ekspertiz raporu, 
            tamir faturası gibi belgelerin temin edilmesi ve takibi bizim sorumluluğumuzda.
          </p>
        </section>
      </div>
    </main>
  );
}

