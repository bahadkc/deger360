import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'Değer360 olarak kullanıcı verilerini nasıl topladığımız, sakladığımız ve koruduğumuza dair gizlilik prensiplerimiz.',
  openGraph: {
    title: 'Gizlilik Politikası | Değer360',
    description: 'Değer360 gizlilik politikası. Kişisel bilgilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi.',
  },
};

export default function GizlilikPolitikasiPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-primary-blue hover:text-primary-orange transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>

        <h1 className="text-4xl font-bold text-dark-blue mb-8">
          Gizlilik Politikası
        </h1>

        <div className="prose prose-lg max-w-none space-y-6 text-neutral-800">
          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">1. Giriş</h2>
            <p>
              Değer360 olarak, kullanıcılarımızın gizliliğine saygı duyuyor ve kişisel verilerinizi korumak 
              için gerekli tüm önlemleri alıyoruz. Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde 
              veya hizmetlerimizi kullandığınızda kişisel bilgilerinizin nasıl toplandığını, kullanıldığını 
              ve korunduğunu açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">2. Toplanan Bilgiler</h2>
            <p>
              Hizmetlerimizi kullandığınızda aşağıdaki bilgileri toplayabiliriz:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Kişisel Bilgiler:</strong> Ad, soyad, T.C. kimlik numarası, doğum tarihi</li>
              <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, posta adresi</li>
              <li><strong>Araç Bilgileri:</strong> Araç markası, modeli, plaka numarası, kaza bilgileri</li>
              <li><strong>Finansal Bilgiler:</strong> Banka hesap bilgileri, IBAN numarası</li>
              <li><strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı türü, cihaz bilgileri, çerezler</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">3. Bilgilerin Kullanım Amacı</h2>
            <p>
              Topladığımız bilgileri şu amaçlarla kullanırız:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Değer kaybı tazminat talebinizi değerlendirmek ve işlemek</li>
              <li>Hukuki süreçleri yürütmek ve takip etmek</li>
              <li>Sizinle iletişime geçmek ve bilgilendirme yapmak</li>
              <li>Hizmet kalitemizi geliştirmek</li>
              <li>Yasal yükümlülüklerimizi yerine getirmek</li>
              <li>Güvenlik ve dolandırıcılık önleme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">4. Bilgilerin Paylaşımı</h2>
            <p>
              Kişisel bilgilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmayız:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Hizmet Sağlayıcılar:</strong> Avukatlar, ekspertiz firmaları gibi hizmet sunumumuz için gerekli iş ortaklarımız</li>
              <li><strong>Yasal Zorunluluklar:</strong> Mahkemeler, sigorta şirketleri ve diğer resmi makamlar</li>
              <li><strong>Açık Rızanız:</strong> Önceden onayınızı aldığımız durumlar</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">5. Çerezler (Cookies)</h2>
            <p>
              Web sitemiz, kullanıcı deneyimini geliştirmek için çerezler kullanmaktadır. Çerezler, 
              tarayıcınız tarafından bilgisayarınızda saklanan küçük metin dosyalarıdır.
            </p>
            <p><strong>Kullandığımız Çerezler:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Zorunlu Çerezler:</strong> Web sitesinin çalışması için gerekli çerezler</li>
              <li><strong>Analitik Çerezler:</strong> Web sitesi kullanımını analiz etmek için (Google Analytics vb.)</li>
              <li><strong>İşlevsel Çerezler:</strong> Tercihlerinizi hatırlamak için</li>
            </ul>
            <p>
              Tarayıcı ayarlarınızdan çerezleri yönetebilir veya reddedebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">6. Veri Güvenliği</h2>
            <p>
              Kişisel verilerinizin güvenliğini sağlamak için teknik ve idari önlemler alıyoruz:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>SSL şifreleme ile güvenli veri iletimi</li>
              <li>Güvenli sunucularda veri saklama</li>
              <li>Erişim kontrolü ve yetkilendirme sistemleri</li>
              <li>Düzenli güvenlik güncellemeleri ve testleri</li>
              <li>Personel eğitimi ve gizlilik taahhütleri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">7. Veri Saklama Süresi</h2>
            <p>
              Kişisel verileriniz, toplama amacının gerektirdiği süre boyunca ve yasal saklama yükümlülüklerimiz 
              çerçevesinde saklanır. İşleme amacı ortadan kalktığında veya yasal saklama süresi dolduğunda 
              verileriniz silinir, yok edilir veya anonim hale getirilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">8. Haklarınız</h2>
            <p>
              Kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Verilerinize erişim talep etme</li>
              <li>Verilerinizin düzeltilmesini isteme</li>
              <li>Verilerinizin silinmesini talep etme</li>
              <li>Veri işlemeye itiraz etme</li>
              <li>Verilerinizin taşınabilirliğini talep etme</li>
              <li>Otomatik karar verme süreçlerine itiraz etme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">9. Üçüncü Taraf Bağlantılar</h2>
            <p>
              Web sitemiz, üçüncü taraf web sitelerine bağlantılar içerebilir. Bu sitelerin gizlilik 
              politikalarından sorumlu değiliz. Bu siteleri ziyaret ettiğinizde kendi gizlilik politikalarını 
              incelemenizi öneririz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">10. Politika Değişiklikleri</h2>
            <p>
              Bu Gizlilik Politikası&apos;nı zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda 
              sizi e-posta veya web sitesi bildirimi ile bilgilendireceğiz. Güncel politikayı düzenli 
              olarak kontrol etmenizi öneririz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">11. İletişim</h2>
            <p>
              Gizlilik politikamız hakkında sorularınız veya talepleriniz için bizimle iletişime geçebilirsiniz:
            </p>
            <div className="bg-neutral-50 p-4 rounded-lg mt-4">
              <p><strong>E-posta:</strong> info@deger360.net</p>
              <p><strong>Telefon:</strong> +90 505 705 33 05</p>
              <p><strong>Adres:</strong> Şirinyalı mahallesi, 1501 sokak, no: 9/5, Muratpaşa/ANTALYA</p>
            </div>
          </section>

          <section>
            <p className="text-sm text-neutral-600 mt-8">
              <strong>Son Güncelleme:</strong> 18 Aralık 2024
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

