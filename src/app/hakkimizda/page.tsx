import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda - Değer Kaybı Danışmanlığı',
  description: 'DeğerKaybım hakkında bilgiler, ekibimiz ve misyonumuz. %97 başarı oranı ile araç değer kaybı tazminatında uzman ekibimizle yanınızdayız. Hemen başvurun!',
};

export default function HakkimizdaPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-4 sm:mb-6 md:mb-8 text-center">
        Hakkımızda
      </h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-blue mb-4">Biz Kimiz?</h2>
          <p className="text-base sm:text-lg text-neutral-800 mb-4">
            Değer360 olarak, araç değer kaybı tazminatı konusunda uzmanlaşmış bir danışmanlık firmasıyız. 
            Kaza sonrası mağduriyet yaşayan müşterilerimizin haklarını en etkili şekilde almalarını sağlamak 
            için çalışıyoruz.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-blue mb-4">Ekip ve Deneyim</h2>
          <p className="text-base sm:text-lg text-neutral-800 mb-4">
            Ekibimiz, +20 yıllık avukatlık tecrübesi olan deneyimli hukukçular ve ekspertiz uzmanlarından 
            oluşmaktadır. %97 başarı oranımız ve müşteri memnuniyeti odaklı yaklaşımımız ile sektörde 
            güvenilir bir isim olmayı hedefliyoruz.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-blue mb-4">Misyonumuz</h2>
          <p className="text-base sm:text-lg text-neutral-800 mb-4">
            Misyonumuz, kaza sonrası karmaşık hukuki süreçlerde müşterilerimizin yanında olmak ve 
            tüm işlemleri profesyonel ekibimizle yöneterek onların zamanını ve enerjisini korumaktır. 
            Ön ödeme almadan, sadece başarılı sonuçta komisyon alarak çalışıyoruz.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-blue mb-4">Neden Bizi Seçmelisiniz?</h2>
          <ul className="list-disc pl-6 space-y-2 text-base sm:text-lg text-neutral-800">
            <li>%97 başarı oranı ile sektörde öncüyüz</li>
            <li>Ön ödeme almıyoruz, risk bizde</li>
            <li>Deneyimli avukat ve ekspertiz ekibi</li>
            <li>Şeffaf süreç yönetimi</li>
            <li>Hızlı dönüş süreleri</li>
            <li>750+ başarılı dava</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

