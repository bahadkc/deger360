import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: '6698 sayılı KVKK kapsamında kişisel verilerinizin işlenmesi, korunması ve haklarınızla ilgili detaylı aydınlatma metnimiz.',
  openGraph: {
    title: 'KVKK Aydınlatma Metni | Değer360',
    description: 'Değer360 KVKK kapsamında kişisel verilerinizin işlenmesine ilişkin aydınlatma metni.',
  },
};

export default function KVKKPage() {
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
          KVKK Aydınlatma Metni
        </h1>

        <div className="prose prose-lg max-w-none space-y-6 text-neutral-800">
          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">1. Veri Sorumlusu</h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel verileriniz; 
              veri sorumlusu olarak Değer360 tarafından aşağıda açıklanan kapsamda işlenebilecektir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">2. Kişisel Verilerin İşlenme Amacı</h2>
            <p>
              Toplanan kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları 
              ve amaçları dahilinde aşağıdaki amaçlarla işlenebilmektedir:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Araç değer kaybı tazminat talebinizin değerlendirilmesi</li>
              <li>Hukuki süreçlerin yürütülmesi ve takibi</li>
              <li>Sizlerle iletişime geçilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Hizmet kalitesinin geliştirilmesi</li>
              <li>Müşteri memnuniyetinin sağlanması</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">3. İşlenen Kişisel Veriler</h2>
            <p>
              Değer360 tarafından işlenen kişisel verileriniz:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kimlik Bilgileri (Ad, Soyad, T.C. Kimlik Numarası)</li>
              <li>İletişim Bilgileri (Telefon, E-posta, Adres)</li>
              <li>Araç Bilgileri (Marka, Model, Plaka)</li>
              <li>Kaza ve Hasar Bilgileri</li>
              <li>Finansal Bilgiler (IBAN, Banka Hesap Bilgileri)</li>
              <li>Hukuki İşlem Bilgileri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">4. Kişisel Verilerin Aktarılması</h2>
            <p>
              Toplanan kişisel verileriniz, KVKK&apos;nın 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartları 
              ve amaçları çerçevesinde:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>İş birliği içinde olduğumuz avukatlık bürolarına</li>
              <li>Mahkemeler ve icra dairelerine</li>
              <li>Sigorta şirketlerine</li>
              <li>Ekspertiz firmalarına</li>
              <li>Yasal yükümlülükler nedeniyle kamu kurum ve kuruluşlarına</li>
            </ul>
            <p>aktarılabilecektir.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
            <p>
              Kişisel verileriniz, web sitemiz, telefon, e-posta, fiziksel başvuru gibi kanallar aracılığıyla 
              sözlü, yazılı veya elektronik ortamda toplanmaktadır. Bu veriler:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sözleşmenin kurulması ve ifası için gerekli olması</li>
              <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
              <li>Meşru menfaatlerimiz için zorunlu olması</li>
              <li>Açık rızanızın bulunması</li>
            </ul>
            <p>hukuki sebeplerine dayanılarak işlenmektedir.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">6. Kişisel Veri Sahibinin Hakları</h2>
            <p>
              KVKK&apos;nın 11. maddesi uyarınca, kişisel veri sahipleri olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
              <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
              <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
              <li>Kişisel verilerinizin düzeltilmesi, silinmesi veya yok edilmesi halinde bu işlemlerin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-dark-blue mb-4">7. İletişim</h2>
            <p>
              Yukarıda belirtilen haklarınızı kullanmak için bizimle aşağıdaki iletişim bilgilerinden ulaşabilirsiniz:
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

