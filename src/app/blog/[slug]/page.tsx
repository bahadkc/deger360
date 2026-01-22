import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import { PageCTASection } from '@/components/sections/page-cta-section';
import { ScrollAnimation } from '@/components/ui/scroll-animation';

// Blog yazıları veritabanı (şimdilik statik)
const blogPosts: Record<string, {
  id: string;
  title: string;
  content?: string; // İçerik JSX içinde olduğu için optional
  excerpt: string;
  slug: string;
  publishedAt: string;
  imageUrl?: string;
  category?: string;
  metaDescription: string;
}> = {
  'kaza-yaptim-simdi-ne-olacak-aracinizdaki-gizli-parayi-deger-kaybini-nasil-geri-alirsiniz': {
    id: '1',
    title: 'Kaza Yaptım, Şimdi Ne Olacak? Aracınızdaki "Gizli Parayı" (Değer Kaybını) Nasıl Geri Alırsınız?',
    excerpt: 'Kaza sonrası aracınızda oluşan değer kaybını nasıl alırsınız? Değer360 ile masrafsız, ön ödemesiz ve %97 başarı oranıyla değer kaybı tazminatı süreci hakkında rehber.',
    slug: 'kaza-yaptim-simdi-ne-olacak-aracinizdaki-gizli-parayi-deger-kaybini-nasil-geri-alirsiniz',
    publishedAt: '2024-12-20',
    category: 'Rehber',
    metaDescription: 'Kaza sonrası aracınızda oluşan değer kaybını nasıl alırsınız? Değer360 ile masrafsız, ön ödemesiz ve %97 başarı oranıyla değer kaybı tazminatı süreci hakkında rehber.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug];
  
  if (!post) {
    return {
      title: 'Blog Yazısı Bulunamadı',
    };
  }

  return {
    title: post.title,
    description: post.metaDescription,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-dark-blue mb-4">Blog Yazısı Bulunamadı</h1>
          <Link href="/blog" className="text-primary-orange hover:text-orange-600">
            Blog sayfasına dön
          </Link>
        </div>
      </main>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark-blue to-blue-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollAnimation>
            <Link
              href="/blog"
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Blog'a Dön
            </Link>
            {post.category && (
              <span className="inline-block px-3 py-1 text-sm font-semibold text-primary-orange bg-white rounded-full mb-4">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            <div className="flex items-center text-white/80 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Blog Content */}
      <article className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none prose-headings:text-dark-blue prose-headings:font-bold prose-a:text-primary-orange prose-a:no-underline hover:prose-a:underline prose-strong:text-dark-blue prose-img:rounded-lg prose-img:shadow-md prose-p:text-neutral-700 prose-p:leading-relaxed prose-li:text-neutral-700">
              <p className="text-xl text-neutral-700 mb-6 font-medium leading-relaxed">
                Trafikte seyir halindeyken o istenmeyen ses duyuldu: <strong>"Arabama çarptılar!"</strong>
              </p>

              <p>
                İlk şoku atlattıktan sonra tutanaklar tutuldu, sigorta şirketleri arandı ve aracınız servise çekildi. Aracınız onarılıp pırıl pırıl teslim edildiğinde her şeyin bittiğini düşünebilirsiniz. Ancak tecrübeli bir dost olarak size acı ama gerçek bir detayı hatırlatmamız gerek: <strong>Aracınızın kaportası düzelmiş olabilir ama piyasa değeri düştü.</strong>
              </p>

              <p>
                Google'da "kaza yaptım ne yapacağım" diye aratıp bu yazıya ulaştıysanız, muhtemelen hakkınız olan ama sigorta şirketlerinin size gümüş tepside sunmadığı o tazminatı, yani <strong>Değer Kaybını</strong> merak ediyorsunuzdur.
              </p>

              <p>
                Gelin, 20 yılı aşkın hukuk ve sektör tecrübemizle, bu süreci sizin için en şeffaf ve masrafsız şekilde nasıl yönettiğimizi anlatalım.
              </p>

              {/* Görsel - SEO için alt text ile */}
              <div className="my-8 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/images/blog/degerkaybihesaplama.png"
                  alt="Araç değer kaybı hesaplama"
                  width={1200}
                  height={630}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                Değer Kaybı Nedir ve Neden Hakkınızdır?
              </h2>

              <p>
                En basit anlatımla değer kaybı; aracınızın kaza öncesindeki 2. el piyasa değeri ile kaza yapıp onarıldıktan sonraki değeri arasındaki farktır.
              </p>

              <p>
                Aracınız yetkili serviste, orijinal parçalarla onarılsa bile, TRAMER kayıtlarında "hasarlı" olarak görünecektir. Arabanızı satmak istediğinizde alıcılar, "Bu araç kazalı, fiyatı düşürelim" diyecektir. İşte bu fiyat farkı, sizin cebinizden çıkan paradır. Türk Ticaret Kanunu ve ilgili sigorta mevzuatları gereği, kusursuz veya az kusurlu olduğunuz kazalarda bu farkı karşı tarafın trafik sigortasından nakit olarak talep etme hakkınız vardır.
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                Peki Bu Para Nasıl Alınır? Süreç Nasıl İşler?
              </h2>

              <p>
                Değer kaybı tazminatını almak, sadece bir dilekçe yazıp beklemekten ibaret değildir. Sigorta şirketleri genellikle minimum ödemeyi yapmaya veya talebi reddetmeye meyillidir. İşte bu noktada <Link href="https://deger360.net">Değer360</Link> olarak devreye giriyoruz.
              </p>

              <p>
                Sürecin genellikle 2 ila 6 ay arasında sürdüğünü (dosyanın durumuna göre) en baştan belirtelim. Ancak merak etmeyin, bu süre zarfında sizin yapmanız gereken tek şey, günlük hayatınıza devam etmek.
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                Değer360 ile 3 Adımda Tazminat Süreci
              </h2>

              <p>
                Bizimle çalışmanın en büyük farkı, <strong>"Önce Hizmet, Sonra Ücret"</strong> prensibidir.
              </p>

              <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                1. Ücretsiz Hesaplama ve Başvuru
              </h3>
              <p>
                Web sitemizdeki Değer Kaybı Hesaplama ve Teklif Formu üzerinden bilgilerinizi girersiniz. Uzman ekibimiz, aracınızın model yılı, km'si ve hasar durumuna göre alabileceğiniz tahmini tutarı hesaplar.
              </p>

              <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                2. Sıfır Risk ile Süreç Yönetimi
              </h3>
              <p>
                Başvurunuz onaylandığında süreci başlatırız. Burası çok önemli: Sizden dosya masrafı, eksper ücreti veya başvuru harcı adı altında hiçbir ön ödeme talep etmeyiz. Tüm masrafları Değer360 olarak biz üstleniriz. 20 yıllık avukatlık ve sektör tecrübemizle, sigorta şirketlerine karşı hukuki süreci biz yönetiriz.
              </p>

              <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                3. Sonuç ve Ödeme
              </h3>
              <p>
                Yılda ortalama 750 dava dosyası yönetiyor ve %97 gibi yüksek bir başarı oranıyla çalışıyoruz. Tazminatınız sigorta şirketinden tahsil edildiğinde, anlaşılan komisyon oranını düşer ve kalan tutarı hesabınıza yatırırız.
              </p>

              <div className="bg-orange-50 border-l-4 border-primary-orange p-4 my-6 rounded">
                <p className="font-semibold text-dark-blue mb-2">Kritik Not:</p>
                <p>
                  Çok düşük bir ihtimal de olsa (%3), eğer tazminat alamazsak? Sizden yine de hiçbir ücret talep etmeyiz. Yani cebinizden para çıkma riski sıfırdır.
                </p>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                Neden Biz? (Sadece Söz Değil, Şeffaflık)
              </h2>

              <p>
                Sektörde "biz hallederiz" diyen çoktur ancak süreci şeffaf yöneten azdır. Değer360 olarak farkımız, köklü hukuk geçmişimiz ve teknolojiyi kullanma biçimimizdir.
              </p>

              <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                Dosyam Nerede?
              </h3>
              <p>
                Bize başvurduğunuz andan itibaren, web sitemizdeki "Dosyam Nerede?" paneli üzerinden sürecin hangi aşamada olduğunu (Başvuru yapıldı mı? Tahkimde mi? Ödeme aşamasında mı?) canlı olarak takip edebilirsiniz.
              </p>

              <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                Masrafsızlık Garantisi
              </h3>
              <p>
                Davayı kazanana kadar finansal yük tamamen bizim omuzlarımızdadır.
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                Kaza Yaptınız, Beklemeyin!
              </h2>

              <p>
                Değer kaybı başvurularında zamanaşımı süresi (kaza tarihinden itibaren 2 yıl) işlediğini unutmayın. Aracınızın değerini korumak ve hakkınız olan tazminatı profesyonel bir ekiple, hiç yorulmadan almak istiyorsanız doğru yerdesiniz.
              </p>

              <p className="text-lg font-semibold text-dark-blue mt-6 mb-4">
                Siz kahvenizi içerken biz bürokrasiyle uğraşalım.
              </p>

              {/* CTA Button */}
              <div className="my-8 text-center not-prose">
                <Link
                  href="/teklif"
                  className="inline-block bg-primary-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  👉 Ücretsiz Değer Kaybı Teklifi Alın
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      <PageCTASection />
    </main>
  );
}
