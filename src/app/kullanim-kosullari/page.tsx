import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | Değer360',
  description: 'Değer360 web sitesi ve hizmetlerinin kullanım koşulları. Hak ve sorumluluklarınız hakkında bilgi.',
  openGraph: {
    title: 'Kullanım Koşulları | Değer360',
    description: 'Değer360 web sitesi ve hizmetlerinin kullanım koşulları. Hak ve sorumluluklarınız hakkında bilgi.',
  },
};

export default function KullanimKosullariPage() {
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
          Kullanım Koşulları
        </h1>

        <div className="prose prose-lg max-w-none space-y-6 text-neutral-800">
          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">1. Genel Hükümler</h2>
            <p>
              Bu web sitesi Değer360 tarafından işletilmektedir. Web sitemizi ziyaret ederek veya 
              hizmetlerimizi kullanarak bu Kullanım Koşulları&apos;nı kabul etmiş sayılırsınız. Bu koşulları 
              kabul etmiyorsanız, lütfen web sitemizi kullanmayın.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">2. Hizmet Tanımı</h2>
            <p>
              Değer360, araç değer kaybı tazminat danışmanlığı hizmeti sunmaktadır. Hizmetlerimiz:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Araç değer kaybı hesaplama ve değerlendirme</li>
              <li>Tazminat talep sürecinde hukuki destek</li>
              <li>Ekspertiz raporlarının hazırlanması</li>
              <li>Dava ve icra takip süreçlerinin yönetimi</li>
              <li>Müvekkil bilgilendirme ve süreç takibi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">3. Kullanıcı Yükümlülükleri</h2>
            <p>
              Web sitemizi ve hizmetlerimizi kullanırken:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Doğru, güncel ve eksiksiz bilgi sağlamalısınız</li>
              <li>Hesap bilgilerinizi gizli tutmalısınız</li>
              <li>Yasa dışı amaçlar için kullanmamalısınız</li>
              <li>Başkalarının haklarını ihlal etmemelisiniz</li>
              <li>Web sitesinin güvenliğini tehlikeye atmamalısınız</li>
              <li>Virüs, zararlı yazılım veya kod yüklememeli ya da aktarmamalısınız</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">4. Hizmet Bedeli ve Ödeme</h2>
            <p>
              Değer360 hizmet bedeli politikası:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Ön Ödeme Yok:</strong> Dosya açılışı için herhangi bir ön ödeme talep edilmez</li>
              <li><strong>Başarı Komisyonu:</strong> Sadece tazminat alındığı takdirde, alınan tutardan belirli bir oranda komisyon alınır</li>
              <li><strong>Kazanç Yok - Ödeme Yok:</strong> Tazminat alamadığınız durumda herhangi bir ücret ödemeniz gerekmez</li>
              <li><strong>Şeffaf Fiyatlandırma:</strong> Komisyon oranları başvuru sırasında açıkça belirtilir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">5. Sözleşme ve İptal</h2>
            <p>
              <strong>Sözleşme Başlangıcı:</strong> Başvurunuzu onaylayıp vekalet vermekle birlikte 
              hizmet sözleşmesi başlamış olur.
            </p>
            <p>
              <strong>İptal Hakkı:</strong> Dava açılmadan önce herhangi bir masraf ödemeden sözleşmeyi 
              iptal edebilirsiniz. Dava açıldıktan sonra iptal durumunda, yapılan masraflar talep edilebilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">6. Sorumluluk Sınırlamaları</h2>
            <p>
              Değer360:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Her dosyanın kazanılacağını garanti etmez</li>
              <li>Mahkeme kararlarından sorumlu tutulamaz</li>
              <li>Üçüncü tarafların (sigorta şirketleri, mahkemeler) eylemlerinden sorumlu değildir</li>
              <li>Web sitesindeki bilgilerin %100 doğruluğunu garanti etmez</li>
              <li>Teknik arızalar veya kesintilerden sorumlu tutulamaz</li>
            </ul>
            <p>
              Ancak, mesleki standartlara uygun, özenli ve profesyonel hizmet sunmayı taahhüt ederiz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">7. Fikri Mülkiyet Hakları</h2>
            <p>
              Bu web sitesindeki tüm içerik (metin, görsel, logo, tasarım vb.) Değer360&apos;ın mülkiyetindedir 
              ve telif hakkı yasaları ile korunmaktadır. İçeriği izinsiz kopyalayamaz, çoğaltamaz, 
              dağıtamaz veya ticari amaçla kullanamazsınız.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">8. Gizlilik</h2>
            <p>
              Kişisel verilerinizin korunması bizim için önemlidir. Gizlilik politikamız, kişisel 
              bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu detaylı olarak açıklar. 
              Lütfen{' '}
              <Link href="/gizlilik-politikasi" className="text-primary-blue hover:text-primary-orange">
                Gizlilik Politikası
              </Link>
              &apos;nı inceleyin.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">9. Bilgi Verme ve İletişim</h2>
            <p>
              Müşterilerimiz, dosya durumlarını &quot;Dosyam Nerede?&quot; bölümünden takip edebilirler. 
              Ayrıca önemli gelişmeler hakkında e-posta ve telefon ile bilgilendirilirler.
            </p>
            <p>
              Herhangi bir sorunuz veya şikayetiniz için bizimle iletişime geçebilirsiniz. 
              Şikayetleriniz en kısa sürede değerlendirilecek ve size dönüş yapılacaktır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">10. Yasal Uyuşmazlıklar</h2>
            <p>
              Bu Kullanım Koşulları Türkiye Cumhuriyeti yasalarına tabidir. Hizmetlerimizle ilgili 
              ortaya çıkabilecek uyuşmazlıklarda Antalya Mahkemeleri ve İcra Daireleri yetkilidir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">11. Değişiklikler</h2>
            <p>
              Değer360, bu Kullanım Koşulları&apos;nı herhangi bir zamanda değiştirme hakkını saklı tutar. 
              Değişiklikler web sitesinde yayınlandığı anda yürürlüğe girer. Önemli değişiklikler 
              için kayıtlı kullanıcılarımızı e-posta ile bilgilendiririz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">12. Feragatname</h2>
            <p>
              Web sitemizde sunulan bilgiler genel bilgilendirme amaçlıdır ve hukuki tavsiye niteliği 
              taşımaz. Her dosya kendine özgüdür ve farklı sonuçlanabilir. Kesin bir tahmin veya garanti 
              verilmesi mümkün değildir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">13. İletişim Bilgileri</h2>
            <p>
              Kullanım koşullarımız hakkında sorularınız için:
            </p>
            <div className="bg-neutral-50 p-4 rounded-lg mt-4">
              <p><strong>E-posta:</strong> info@deger360.net</p>
              <p><strong>Telefon:</strong> 0505 705 33 05</p>
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

