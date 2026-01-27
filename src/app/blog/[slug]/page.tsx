import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { Calendar, ArrowLeft, CheckCircle } from 'lucide-react';
import { PageCTASection } from '@/components/sections/page-cta-section';
import { ScrollAnimation } from '@/components/ui/scroll-animation';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deger360.net';

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
  'ticari-araclarda-kazanc-kaybi-yatis-parasi-ve-deger-kaybi-nasil-alinir': {
    id: '2',
    title: 'Ticari Araçlarda Kazanç Kaybı (Yatış Parası) ve Değer Kaybı Nasıl Alınır?',
    excerpt: 'Ticari araç sahipleri kaza sonrası hem değer kaybı hem de yatış parası (kazanç kaybı) talep edebilir. Taksi, dolmuş, servis ve nakliye araçları için tazminat rehberi.',
    slug: 'ticari-araclarda-kazanc-kaybi-yatis-parasi-ve-deger-kaybi-nasil-alinir',
    publishedAt: '2025-01-26',
    category: 'Rehber',
    metaDescription: 'Ticari araç sahipleri için kazanç kaybı (yatış parası) ve değer kaybı tazminatı rehberi. Taksi, dolmuş, servis, nakliye araçları ve rent a car için başvuru şartları ve süreç.',
  },
  'pert-araclar-deger-kaybi-alinabilir-mi-yargitay-kararlari': {
    id: '3',
    title: 'Ağır Hasarlı (Pert) Araçlar İçin Değer Kaybı Alınabilir mi? Yargıtay Kararları Ne Diyor?',
    excerpt: 'Pert (ağır hasarlı) araçlar için değer kaybı tazminatı alınabilir mi? Yargıtay kararları, istisnai durumlar ve pert araç sahiplerinin hakları hakkında detaylı rehber.',
    slug: 'pert-araclar-deger-kaybi-alinabilir-mi-yargitay-kararlari',
    publishedAt: '2025-01-26',
    category: 'Rehber',
    metaDescription: 'Pert araçlar için değer kaybı tazminatı alınabilir mi? Yargıtay kararları, istisnai durumlar, rayiç bedel itirazı ve pert araç sahiplerinin hakları hakkında detaylı bilgi.',
  },
  'kiralik-arac-rent-a-car-deger-kaybi-kim-oder': {
    id: '4',
    title: 'Kiralık Araçla (Rent a Car) Kaza Yaptım: Değer Kaybını Sürücü mü Öder?',
    excerpt: 'Kiralık araçla kaza yaptığınızda değer kaybını kim öder? Rent a car firmaları, kusur durumları, sigorta paketleri ve sürücü sorumlulukları hakkında detaylı rehber.',
    slug: 'kiralik-arac-rent-a-car-deger-kaybi-kim-oder',
    publishedAt: '2025-01-26',
    category: 'Rehber',
    metaDescription: 'Kiralık araçla kaza yaptığınızda değer kaybını kim öder? Rent a car firmaları, kusur durumları, sigorta paketleri, yatış bedeli ve sürücü sorumlulukları hakkında detaylı bilgi.',
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

  // Reviewed date - yayın tarihinden sonraki bir tarih (örnek: yayın tarihinden 3 gün sonra)
  const reviewedDate = new Date(post.publishedAt);
  reviewedDate.setDate(reviewedDate.getDate() + 3);
  const reviewedDateString = reviewedDate.toISOString().split('T')[0];

  // Article Schema with reviewedBy
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDescription,
    "datePublished": post.publishedAt,
    "dateModified": reviewedDateString,
    "author": {
      "@type": "Organization",
      "name": "Değer360",
      "url": siteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Değer360",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/icon.png`
      }
    },
    "reviewedBy": {
      "@type": "Organization",
      "name": "Değer360 Hukuk Birimi",
      "url": siteUrl
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`
    }
  };

  // FAQPage Schema - Blog yazısına özel sorular
  const faqSchema = slug === 'ticari-araclarda-kazanc-kaybi-yatis-parasi-ve-deger-kaybi-nasil-alinir' ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Taksi yatış parası kimden istenir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Taksi yatış parası (ticari kazanç kaybı), genellikle trafik sigortası limitleri dışında kaldığı için karşı araç sürücüsünden veya ruhsat sahibinden talep edilir. Eğer karşı tarafın İhtiyari Mali Mesuliyet (İMM) sigortası varsa, bu sigortadan da talep edilebilir. Değer360 olarak, dosyanızın durumuna göre en uygun yasal yolu belirleyip süreci yönetiyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Ticari araç kazanç kaybı nasıl hesaplanır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ticari kazanç kaybı hesaplaması, aracın serviste kaldığı gün sayısı ve günlük kazanç tutarına göre yapılır. Taksi ve dolmuş araçlar için günlük yevmiye üzerinden, nakliye araçları için taşıma ücretleri baz alınır. Rent a car araçları için ise aracın kiralanamadığı günler ve günlük kira bedeli dikkate alınır. Hesaplamada vergi levhası, faaliyet belgesi ve servis giriş-çıkış belgeleri kullanılır."
        }
      },
      {
        "@type": "Question",
        "name": "Rent a car araçları için de kazanç kaybı alınabilir mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, rent a car (kiralık araç) işletmeleri de kazanç kaybı talep edebilir. Aracın serviste kaldığı süre boyunca kiralanamadığı için oluşan gelir kaybı, TBK Madde 49 uyarınca tazmin edilebilir. Bu durumda aracın günlük kira bedeli ve serviste kaldığı gün sayısı çarpılarak hesaplama yapılır. Rent a car şirketleri için de Değer360 ile başvuru yapabilirsiniz."
        }
      }
    ]
  } : slug === 'kaza-yaptim-simdi-ne-olacak-aracinizdaki-gizli-parayi-deger-kaybini-nasil-geri-alirsiniz' ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Değer kaybı başvurusu için zaman aşımı süresi nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Değer kaybı başvurusu için zaman aşımı süresi, kaza tarihinden itibaren 2 yıldır. Bu süre içinde başvuru yapılmazsa, hakkınızı kaybedersiniz. Bu yüzden kaza yaptıktan sonra mümkün olan en kısa sürede başvuru yapmanız önemlidir. Değer360 olarak, zaman aşımına uğramadan dosyanızı yönetiyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Değer kaybı tazminatı ne kadar sürer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Değer kaybı tazminat süreci, dosyanın durumuna ve sigorta şirketinin tutumuna göre 2 ile 6 ay arasında değişebilir. Eğer sigorta şirketi ödemeyi reddederse ve tahkim/dava sürecine girilirse, bu süre 6-12 aya kadar uzayabilir. Değer360 olarak, sürecin her aşamasını \"Dosyam Nerede?\" panelimizden şeffafça takip edebilmenizi sağlıyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Değer kaybı başvurusu ücretli mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hayır, Değer360 ile değer kaybı başvurusu tamamen ücretsizdir. Ön inceleme, başvuru süreci ve tüm hukuki işlemler için sizden hiçbir ön ödeme talep etmiyoruz. Sadece tazminat başarıyla alındığında, önceden belirlenen komisyon oranı üzerinden hizmet bedeli alınır. Eğer tazminat alamazsak, sizden yine de hiçbir ücret talep edilmez."
        }
      }
    ]
  } : slug === 'pert-araclar-deger-kaybi-alinabilir-mi-yargitay-kararlari' ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Aracım perte çıktı, değer kaybı davası açabilir miyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hayır. Araç perte ayrıldığında sigorta şirketi aracın kaza tarihindeki 2. el piyasa değerini öder. Bu ödeme, aracın tüm değerini kapsadığı için ayrıca değer kaybı oluşmaz."
        }
      },
      {
        "@type": "Question",
        "name": "Geçmişte ağır hasar kaydı olan aracım yeni bir kaza yaptı, değer kaybı alabilir miyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Genellikle hayır. Sigorta eksperleri ve Yargıtay kararları, daha önce ağır hasar (pert) işlemi görmüş bir aracın, \"ekonomik ömrünü tamamladığı\" veya \"zaten minimum değerde olduğu\" görüşündedir."
        }
      },
      {
        "@type": "Question",
        "name": "Pert bedeli düşük teklif edildi, ne yapmalıyım?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Değer kaybı davası değil, \"Rayiç Bedel Uyuşmazlığı\" için Sigorta Tahkim Komisyonu'na başvurmalısınız. Bu konuda da hukuki destek almanız, gerçek piyasa değerini almanız için önemlidir."
        }
      }
    ]
  } : slug === 'kiralik-arac-rent-a-car-deger-kaybi-kim-oder' ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Full kasko (Muafiyetsiz) yaptırdım, yine de değer kaybı öder miyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Eğer kiralama sırasında \"Lastik, Cam, Far (LCF)\" dahil tam güvence paketi satın aldıysanız ve sözleşmenizde \"değer kaybı muafiyeti\" maddesi varsa ödemezsiniz. Ancak standart kasko sadece hasarı öder, değer kaybını kapsamaz. Sözleşmenizi kontrol etmelisiniz."
        }
      },
      {
        "@type": "Question",
        "name": "Kiralama şirketi benden değer kaybı için senet istiyor, ne yapmalıyım?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Kurumsal firmalar genellikle kredi kartına bloke (provizyon) koyar. Açık senet imzalamak hukuki açıdan risklidir. Eğer hasar bedeli belliyse, sadece o tutar kadar ödeme yapmanız veya yasal süreci beklemeniz daha sağlıklıdır."
        }
      },
      {
        "@type": "Question",
        "name": "Kiralık araçla kaza yaptım, \"Yatış Parası\" yasal mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, yasaldır. Ticari araçların (taksi, dolmuş, kiralık araç) kaza nedeniyle çalışamadığı günlerin geliri, kusurlu taraftan talep edilebilir. Rent a car firması, aracın o dönemdeki günlük kira bedeli üzerinden bu tutarı sizden isteyebilir."
        }
      }
    ]
  } : null;

  return (
    <main className="min-h-screen">
      {/* Article Schema Markup */}
      <Script id="article-schema" type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </Script>
      {/* FAQPage Schema Markup */}
      {faqSchema && (
        <Script id="faq-schema" type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </Script>
      )}
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
              {slug === 'ticari-araclarda-kazanc-kaybi-yatis-parasi-ve-deger-kaybi-nasil-alinir' ? (
                <>
                  <p className="text-xl text-neutral-700 mb-6 font-medium leading-relaxed">
                    Ticari kazanç kaybı (yatış bedeli); taksi, dolmuş, servis veya nakliye aracı gibi ticari amaçla kullanılan bir aracın, kaza sonrası onarım sürecinde "çalışamamasından" doğan maddi gelirin tazmin edilmesidir. Ticari araç sahipleri, kusursuz oldukları kazalarda sigorta şirketinden sadece aracın piyasa değer düşüşünü (Değer Kaybı) değil, aracın serviste yattığı günlerin parasını da yasal olarak talep edebilirler.
                  </p>

                  {/* Görsel - SEO için alt text ile */}
                  <div className="my-8 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src="/images/blog/ticari-arac-yatis-parasi-kazanc-kaybi-tazminati.jpg"
                      alt="ticari araç kazanç kaybı ve değer kaybı tazminatı"
                      width={1200}
                      height={630}
                      className="w-full h-auto object-cover"
                      priority
                    />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Ticari Araç Sahiplerinin Bilmesi Gereken 2 Temel Hak
                  </h2>

                  <p>
                    Ticari bir araç kaza yaptığında, araç sahibi iki farklı tazminat kalemi için başvuru yapabilir. Bu haklar Türk Borçlar Kanunu (TBK) ve ilgili sigorta mevzuatları ile güvence altındadır:
                  </p>

                  <ul>
                    <li><strong>Araç Değer Kaybı:</strong> Aracın kaza nedeniyle 2. el piyasasında yaşadığı fiyat düşüşüdür. Karşı tarafın trafik sigortasından (ZMSS) tahsil edilir.</li>
                    <li><strong>Ticari Kazanç Kaybı (Yatış Parası):</strong> Aracın serviste kaldığı ve iş yapamadığı günlerin tazminatıdır. Genellikle karşı tarafın araç sahibinden veya varsa İhtiyari Mali Mesuliyet (İMM) sigortasından talep edilir.</li>
                  </ul>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Kimler Yatış Parası (Kazanç Kaybı) Talep Edebilir?
                  </h2>

                  <p>
                    Her kaza yapan araç bu bedeli alamaz. Yargıtay kararları ve sektör uygulamalarına göre şu araç grupları başvurabilir:
                  </p>

                  <ul>
                    <li><strong>Taksiler ve Dolmuşlar:</strong> Günlük yevmiye üzerinden hesaplama yapılır.</li>
                    <li><strong>Servis Araçları:</strong> Öğrenci veya personel servisleri.</li>
                    <li><strong>Nakliye ve Lojistik Araçları:</strong> Kamyon, kamyonet ve tırlar.</li>
                    <li><strong>Rent a Car (Kiralık) Araçlar:</strong> Aracın kiralanamadığı günler baz alınır.</li>
                    <li><strong>Şirket Araçları:</strong> Şirketin ticari faaliyetinde kullanılan aktif araçlar.</li>
                  </ul>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Kazanç Kaybı Başvurusu İçin Gerekli Şartlar Nelerdir?
                  </h2>

                  <p>
                    Değer360 hukuk birimi olarak yönettiğimiz dosyalarda aradığımız temel kriterler şunlardır:
                  </p>

                  <ul>
                    <li><strong>Kusursuzluk Durumu:</strong> Kazada %100 kusurlu olmamalısınız. (Karşı taraf tam veya kısmi kusurlu olmalı).</li>
                    <li><strong>Onarım Süresi İspatı:</strong> Aracın servise giriş ve çıkış tarihlerini gösteren resmi servis formu mutlaka alınmalıdır.</li>
                    <li><strong>Ticari Faaliyet Belgesi:</strong> Vergi levhası, faaliyet belgesi veya ilgili meslek odası kaydı gereklidir.</li>
                    <li><strong>Zamanaşımı:</strong> Kaza tarihinden itibaren 2 yıl içinde başvuru yapılmalıdır.</li>
                  </ul>

                  <div className="bg-orange-50 border-l-4 border-primary-orange p-4 my-6 rounded">
                    <p className="font-semibold text-dark-blue mb-2">Uzman Görüşü:</p>
                    <p>
                      "Pek çok ticari araç sahibi sadece aracının tamir edilmesini yeterli görür. Oysa aracın serviste yattığı 10-15 günlük süre, bir taksici veya nakliyeci için ciddi bir gelir kaybıdır. TBK Madde 49 uyarınca, kusurlu taraf bu zararı ödemekle yükümlüdür."
                    </p>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Değer360 ile Süreç Nasıl Yönetilir?
                  </h2>

                  <p>
                    Bireysel başvurularda sigorta şirketleri veya karşı taraf ödeme yapmaya yanaşmayabilir. Bizimle çalıştığınızda süreç şu şekilde işler:
                  </p>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                    Ücretsiz Analiz
                  </h3>
                  <p>
                    Web sitemizdeki formu doldurursunuz.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                    Hukuki Süreç
                  </h3>
                  <p>
                    20 yıllık avukatlık tecrübemizle, dosyanızı hem değer kaybı hem de kazanç kaybı yönünden inceleriz.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                    Masrafsız Takip
                  </h3>
                  <p>
                    Dosya masrafı veya ön ödeme almayız.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                    Sonuç Odaklılık
                  </h3>
                  <p>
                    Yılda ortalama 750 dava dosyası sonuçlandırıyor ve %97 başarı oranıyla çalışıyoruz.
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Sıkça Sorulan Sorular
                  </h2>

                  <div className="space-y-6 mt-6">
                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Taksi yatış parası kimden istenir?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Taksi yatış parası (ticari kazanç kaybı), genellikle trafik sigortası limitleri dışında kaldığı için karşı araç sürücüsünden veya ruhsat sahibinden talep edilir. Eğer karşı tarafın İhtiyari Mali Mesuliyet (İMM) sigortası varsa, bu sigortadan da talep edilebilir. Değer360 olarak, dosyanızın durumuna göre en uygun yasal yolu belirleyip süreci yönetiyoruz.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Ticari araç kazanç kaybı nasıl hesaplanır?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Ticari kazanç kaybı hesaplaması, aracın serviste kaldığı gün sayısı ve günlük kazanç tutarına göre yapılır. Taksi ve dolmuş araçlar için günlük yevmiye üzerinden, nakliye araçları için taşıma ücretleri baz alınır. Rent a car araçları için ise aracın kiralanamadığı günler ve günlük kira bedeli dikkate alınır. Hesaplamada vergi levhası, faaliyet belgesi ve servis giriş-çıkış belgeleri kullanılır.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Rent a car araçları için de kazanç kaybı alınabilir mi?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Evet, rent a car (kiralık araç) işletmeleri de kazanç kaybı talep edebilir. Aracın serviste kaldığı süre boyunca kiralanamadığı için oluşan gelir kaybı, TBK Madde 49 uyarınca tazmin edilebilir. Bu durumda aracın günlük kira bedeli ve serviste kaldığı gün sayısı çarpılarak hesaplama yapılır. Rent a car şirketleri için de Değer360 ile başvuru yapabilirsiniz.
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="my-8 text-center not-prose">
                    <Link
                      href="/teklif"
                      className="inline-block bg-primary-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
                    >
                      👉 Ticari Kazanç Kaybı ve Değer Kaybı Teklifi Alın
                    </Link>
                  </div>

                  {/* İçerik Denetimi Kutusu */}
                  <div className="my-8 not-prose bg-blue-50 border-l-4 border-primary-blue p-4 sm:p-6 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm sm:text-base text-dark-blue font-semibold mb-1">
                          İçerik Denetimi
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-700">
                          Bu içerik, Değer360 Hukuk Birimi tarafından {formatDate(reviewedDateString)} tarihinde yasal mevzuata uygunluk açısından denetlenmiştir.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : slug === 'kaza-yaptim-simdi-ne-olacak-aracinizdaki-gizli-parayi-deger-kaybini-nasil-geri-alirsiniz' ? (
                <>
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
                  src="/images/blog/deger-kaybi-hesaplama.png"
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

              <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                Sıkça Sorulan Sorular
              </h2>

              <div className="space-y-6 mt-6">
                <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                  <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                    Değer kaybı başvurusu için zaman aşımı süresi nedir?
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    Değer kaybı başvurusu için zaman aşımı süresi, kaza tarihinden itibaren 2 yıldır. Bu süre içinde başvuru yapılmazsa, hakkınızı kaybedersiniz. Bu yüzden kaza yaptıktan sonra mümkün olan en kısa sürede başvuru yapmanız önemlidir. Değer360 olarak, zaman aşımına uğramadan dosyanızı yönetiyoruz.
                  </p>
                </div>

                <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                  <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                    Değer kaybı tazminatı ne kadar sürer?
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    Değer kaybı tazminat süreci, dosyanın durumuna ve sigorta şirketinin tutumuna göre 2 ile 6 ay arasında değişebilir. Eğer sigorta şirketi ödemeyi reddederse ve tahkim/dava sürecine girilirse, bu süre 6-12 aya kadar uzayabilir. Değer360 olarak, sürecin her aşamasını "Dosyam Nerede?" panelimizden şeffafça takip edebilmenizi sağlıyoruz.
                  </p>
                </div>

                <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                  <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                    Değer kaybı başvurusu ücretli mi?
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    Hayır, Değer360 ile değer kaybı başvurusu tamamen ücretsizdir. Ön inceleme, başvuru süreci ve tüm hukuki işlemler için sizden hiçbir ön ödeme talep etmiyoruz. Sadece tazminat başarıyla alındığında, önceden belirlenen komisyon oranı üzerinden hizmet bedeli alınır. Eğer tazminat alamazsak, sizden yine de hiçbir ücret talep edilmez.
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="my-8 text-center not-prose">
                <Link
                  href="/teklif"
                  className="inline-block bg-primary-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  👉 Ücretsiz Değer Kaybı Teklifi Alın
                </Link>
              </div>

              {/* İçerik Denetimi Kutusu */}
              <div className="my-8 not-prose bg-blue-50 border-l-4 border-primary-blue p-4 sm:p-6 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm sm:text-base text-dark-blue font-semibold mb-1">
                      İçerik Denetimi
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-700">
                      Bu içerik, Değer360 Hukuk Birimi tarafından {formatDate(reviewedDateString)} tarihinde yasal mevzuata uygunluk açısından denetlenmiştir.
                    </p>
                  </div>
                </div>
              </div>
                </>
              ) : slug === 'pert-araclar-deger-kaybi-alinabilir-mi-yargitay-kararlari' ? (
                <>
                  <p className="text-xl text-neutral-700 mb-6 font-medium leading-relaxed">
                    Genel kural olarak, bir kaza sonucunda <strong>"Pert" (Ağır Hasarlı / Tam Hasarlı)</strong> kabul edilen ve trafikten çekilerek hurdaya ayrılan (veya sovtajı satılan) araçlar için <strong>değer kaybı tazminatı alınamaz.</strong> Bunun hukuki mantığı basittir: Sigorta şirketi, aracın kaza öncesindeki "Piyasa Rayiç Bedelini" size ödediği için, aracın artık bir "ikinci el satış değeri" kalmamıştır. Dolayısıyla değerinin düşmesi (değer kaybı) söz konusu olamaz.
                  </p>

                  <p>
                    Ancak, kavram kargaşasından doğan bazı istisnai durumlar ve haklar vardır. 20 yıllık sektör tecrübemizle, Yargıtay'ın bu konudaki bakış açısını ve hangi durumlarda tazminat alabileceğinizi aşağıda netleştirdik.
                  </p>

                  {/* Görsel - SEO için alt text ile */}
                  <div className="my-8 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src="/images/blog/agir-hasarli-pert-arac-deger-kaybi-yargitay-kararlari.jpg"
                      alt="pert araç değer kaybı yargıtay kararları"
                      width={1200}
                      height={630}
                      className="w-full h-auto object-cover"
                      priority
                    />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Yargıtay Kararlarına Göre "Pert" ve "Değer Kaybı" Ayrımı
                  </h2>

                  <p>
                    Yargıtay Hukuk Daireleri'nin yerleşik içtihatlarına göre tazminat hukuku şu prensibi benimser: <em>"Zarar görenin mal varlığındaki eksilme tam olarak karşılanmalıdır."</em>
                  </p>

                  <ol className="list-decimal list-inside space-y-4 my-6">
                    <li>
                      <strong>Araç Pert Olduysa:</strong> Sigorta şirketi size aracın <strong>kaza anındaki piyasa değerini</strong> öder. Siz aracın mülkiyetini (veya sovtajını) sigortaya/alıcıya devredersiniz. Elinize aracın parası geçtiği için ayrıca "aracım değer kaybetti" diyerek tazminat isteyemezsiniz.
                    </li>
                    <li>
                      <strong>Araç "Ağır Hasarlı" Ama Onarıldıysa:</strong> Eğer aracınız için "Pert" kararı verilmediyse, ancak hasar çok büyükse ve araç onarılarak trafiğe döndüyse; bu durumda değer kaybı talep edebilirsiniz. Ancak burada da <strong>"ekonomik bütünlük"</strong> kriteri devreye girer.
                    </li>
                  </ol>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-8 mb-4">
                    Değer Kaybı Hangi Durumlarda "Kesinlikle" Alınamaz?
                  </h3>

                  <p>
                    Değer360 Hukuk Birimi olarak incelediğimiz dosyalarda, başvurunun reddedildiği "Kırmızı Çizgi" durumlar şunlardır:
                  </p>

                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Geçmişte Pert Kaydı Varsa:</strong> Aracınız şu anki kazada az hasar alsa bile, geçmişinde "Ağır Hasarlı" veya "Pert" kaydı varsa, sigorta şirketleri <em>"Bu araç zaten değerini yitirmiş"</em> diyerek ödeme yapmaz.</li>
                    <li><strong>Rayiç Bedel Ödemesi Yapıldıysa:</strong> Sigorta şirketi aracın bedelini size ödeyip dosyayı "Tam Hasar" olarak kapattıysa.</li>
                    <li><strong>KM Sınırı ve Parça Durumu:</strong> (Not: Anayasa Mahkemesi kararıyla 165.000 KM sınırı esnetilmiştir ancak geçmişte işlem gören parçalar için tekrar ödeme yapılmaz.)</li>
                  </ul>

                  <div className="bg-orange-50 border-l-4 border-primary-orange p-4 my-6 rounded">
                    <p className="font-semibold text-dark-blue mb-2">Uzman Görüşü:</p>
                    <p className="italic">
                      "Sürücülerin en sık yaptığı hata, 'Ağır Hasar Kaydı' ile 'Pert' kavramlarını karıştırmaktır. TRAMER'de 'Ağır Hasarlı' yazması, o araçtan değer kaybı alınamayacağı anlamına gelmez. Eğer araç onarıldıysa ve trafiğe çıktıysa, değer kaybı alma ihtimaliniz vardır. Dosyanın uzman bir gözle incelenmesi şarttır."
                    </p>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Pert Araç Sahibinin Başka Hangi Hakları Var?
                  </h2>

                  <p>
                    Değer kaybı alamıyor olmanız, sigorta şirketinin size sunduğu rakamı kabul etmek zorunda olduğunuz anlamına gelmez. Eğer aracınız pert olduysa şunlara dikkat edin:
                  </p>

                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Rayiç Bedel İtirazı:</strong> Sigorta şirketleri genellikle piyasa değerinin altında teklif verir. Aracınızın gerçek değerini talep etme hakkınız vardır.</li>
                    <li><strong>Mahrumiyet Bedeli (İkame Araç):</strong> Aracınızın pert süreci sonuçlanana kadar araçsız kaldığınız süre için tazminat talep edebilirsiniz.</li>
                  </ul>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Aracınızın Durumundan Emin Değil Misiniz?
                  </h2>

                  <p>
                    Kaza sonrası aracınızın statüsü (Pert mi, Onarım mı?) bazen belirsiz olabilir veya sigorta şirketi süreci yanlış yönetebilir. Hakkınız olan parayı içeride bırakmayın.
                  </p>

                  <p>
                    <strong>Değer360</strong> olarak, aracınızın hasar geçmişini ve kaza durumunu <strong>ücretsiz</strong> analiz ediyoruz.
                  </p>

                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li>Ön ödeme yok.</li>
                    <li>Dosya masrafı yok.</li>
                    <li>Sadece tazminat kazandırırsak komisyon alıyoruz.</li>
                  </ul>

                  <p className="text-lg font-semibold text-dark-blue mt-6 mb-4">
                    Aracınız için "Değer Kaybı" veya diğer haklarınızı sorgulamak için 1 dakikanızı ayırın:
                  </p>

                  {/* CTA Button */}
                  <div className="my-8 text-center not-prose">
                    <Link
                      href="/teklif"
                      className="inline-block bg-primary-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
                    >
                      👉 Ücretsiz Dosya Analizi ve Teklif Formu
                    </Link>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Sıkça Sorulan Sorular
                  </h2>

                  <div className="space-y-6 mt-6">
                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Aracım perte çıktı, değer kaybı davası açabilir miyim?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Hayır. Araç perte ayrıldığında sigorta şirketi aracın kaza tarihindeki 2. el piyasa değerini öder. Bu ödeme, aracın tüm değerini kapsadığı için ayrıca değer kaybı oluşmaz.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Geçmişte ağır hasar kaydı olan aracım yeni bir kaza yaptı, değer kaybı alabilir miyim?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Genellikle hayır. Sigorta eksperleri ve Yargıtay kararları, daha önce ağır hasar (pert) işlemi görmüş bir aracın, "ekonomik ömrünü tamamladığı" veya "zaten minimum değerde olduğu" görüşündedir.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Pert bedeli düşük teklif edildi, ne yapmalıyım?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Değer kaybı davası değil, "Rayiç Bedel Uyuşmazlığı" için Sigorta Tahkim Komisyonu'na başvurmalısınız. Bu konuda da hukuki destek almanız, gerçek piyasa değerini almanız için önemlidir.
                      </p>
                    </div>
                  </div>

                  {/* İçerik Denetimi Kutusu */}
                  <div className="my-8 not-prose bg-blue-50 border-l-4 border-primary-blue p-4 sm:p-6 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm sm:text-base text-dark-blue font-semibold mb-1">
                          İçerik Denetimi
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-700">
                          Bu içerik, Değer360 Hukuk Birimi tarafından {formatDate(reviewedDateString)} tarihinde yasal mevzuata uygunluk açısından denetlenmiştir.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : slug === 'kiralik-arac-rent-a-car-deger-kaybi-kim-oder' ? (
                <>
                  <p className="text-xl text-neutral-700 mb-6 font-medium leading-relaxed">
                    Kiralık bir araçla kaza yaptığınızda, hasar masraflarından daha çok korkulan şey, kiralama şirketinin sonradan talep edebileceği "ekstra" bedellerdir. Bu bedellerin başında <strong>"Araç Değer Kaybı"</strong> ve <strong>"Yatış Bedeli"</strong> (Ticari Kazanç Kaybı) gelir.
                  </p>

                  <p>
                    <strong>En kısa ve net cevap şudur:</strong> Kiralık araçla yaptığınız kazada <strong>kusur karşı taraftaysa</strong>, değer kaybını siz ödemezsiniz; karşı tarafın trafik sigortası öder. Ancak <strong>kusur sizdeyse</strong>, imzaladığınız kiralama sözleşmesi ve satın aldığınız sigorta paketi (Mini hasar sigortası, LCF vb.) belirleyici olur. Standart kaskolar genellikle kendi aracınızın değer kaybını karşılamaz, bu nedenle Rent a Car firması bu kaybı sözleşmeye dayanarak sizden talep edebilir.
                  </p>

                  {/* Görsel - SEO için alt text ile */}
                  <div className="my-8 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src="/images/blog/kiralik-arac-rent-a-car-deger-kaybi-kim-oder.jpeg"
                      alt="kiralık araç rent a car değer kaybı kim öder"
                      width={1200}
                      height={630}
                      className="w-full h-auto object-cover"
                      priority
                    />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Kiralık Araç Kazalarında Sorumluluk Tablosu
                  </h2>

                  <p>
                    20 yıllık hukuk ve sektör tecrübemizle, sürücülerin en çok karıştırdığı "Kim, Neyi Öder?" sorusunu netleştirelim:
                  </p>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                    1. Senaryo: Kazada %100 Karşı Taraf Kusurlu
                  </h3>
                  <p className="font-semibold text-dark-blue mb-2">Rahat bir nefes alabilirsiniz.</p>
                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Hasar:</strong> Karşı tarafın trafik sigortası öder.</li>
                    <li><strong>Değer Kaybı:</strong> Karşı tarafın trafik sigortası, kiralama şirketine öder.</li>
                    <li><strong>Sizin Sorumluluğunuz:</strong> Sadece tutanakları ve evrakları kiralama şirketine teslim etmeniz yeterlidir. Cebinizden para çıkmaz.</li>
                  </ul>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                    2. Senaryo: Kazada %100 Siz Kusurlusunuz
                  </h3>
                  <p className="font-semibold text-dark-blue mb-2">Riskli senaryo budur.</p>
                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Hasar:</strong> Kiralık aracın "Rent a Car Kaskosu" varsa hasarı kasko öder. (Alkol, ehliyetsizlik gibi durumlar yoksa).</li>
                    <li><strong>Değer Kaybı:</strong> İşte burası kritiktir. Standart kasko poliçeleri, <strong>aracın kendi değer kaybını ödemez.</strong> Kiralama şirketi, aracın 2. el piyasasındaki değer düşüşünü, Türk Borçlar Kanunu'na ve aranızdaki sözleşmeye dayanarak <strong>sürücüden (sizden) talep edebilir.</strong></li>
                  </ul>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Rent a Car Firması Sizden Neleri İsteyebilir?
                  </h2>

                  <p>
                    Eğer kusurluysanız ve "Süper Güvence" paketi gibi ek korumalar satın almadıysanız, şirket size şu kalemler için fatura (yansıtma) çıkarabilir:
                  </p>

                  <ol className="list-decimal list-inside space-y-3 my-4">
                    <li><strong>Değer Kaybı Bedeli:</strong> Aracın onarım sonrası piyasa değerindeki düşüş.</li>
                    <li><strong>Yatış Bedeli (Ticari Kazanç Kaybı):</strong> Aracın serviste kaldığı gün boyunca şirketin "kira gelirinden mahrum kalması" bedelidir.</li>
                    <li><strong>Dosya Masrafları:</strong> Ekspertiz ve takip giderleri.</li>
                  </ol>

                  <div className="bg-orange-50 border-l-4 border-primary-orange p-4 my-6 rounded">
                    <p className="font-semibold text-dark-blue mb-2">Önemli Uyarı:</p>
                    <p>
                      Bazı merdiven altı firmalar, küçük çizikler için bile fahiş değer kaybı bedelleri isteyebilir. Şirketin sizden talep ettiği tutarın resmi bir eksper raporuna dayanıp dayanmadığını mutlaka sorun.
                    </p>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Filo Sahipleri ve Rent a Car Firmaları İçin: Gelir Kaybını Nasıl Önlersiniz?
                  </h2>

                  <p>
                    Eğer bu yazıyı okuyan bir <strong>Rent a Car işletmecisiyseniz</strong>, filonuzdaki araçların değer kaybını ve yatış bedellerini takip etmek zorlu bir süreç olabilir.
                  </p>

                  <p>
                    <strong>Değer360</strong> olarak, kurumsal filo kiralama şirketlerine özel çözümler sunuyoruz:
                  </p>

                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Toplu Dosya Yönetimi:</strong> Filonuzdaki 10, 50 veya 500 aracın kaza süreçlerini tek panelden yönetiyoruz.</li>
                    <li><strong>Yatış Bedeli Tahsili:</strong> Sadece değer kaybını değil, aracın çalışmadığı günlerin parasını da kusurlu taraftan tahsil etmenize yardımcı oluyoruz.</li>
                    <li><strong>Sıfır Maliyet:</strong> Tıpkı bireysel müşterilerimizde olduğu gibi, ön ödeme almadan, sadece tahsilat üzerinden başarı primiyle çalışıyoruz.</li>
                  </ul>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Kendi Aracınızla Bir Kiralık Araca Çarptıysanız?
                  </h2>

                  <p>
                    Eğer siz kendi aracınızla bir Rent a Car aracına çarptıysanız, karşı taraf (kiralama şirketi) sizin sigortanızdan değer kaybı talep edecektir. Trafik sigortanız limitleri (2024 yılı itibariyle araç başına belirli bir tutara kadar) dahilinde bunu karşılar. Limitleri aşan kısım için size rücu edilebilir.
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Hakkınızı Arayın, Belirsizlikte Kalmayın
                  </h2>

                  <p>
                    İster kaza yapan bir <strong>sürücü</strong>, ister filosu hasar gören bir <strong>şirket sahibi</strong> olun; değer kaybı süreçleri uzmanlık gerektirir.
                  </p>

                  <p>
                    Aracınızın (veya kaza yaptığınız aracın) ne kadar değer kaybı olduğunu merak ediyor musunuz?
                    Aşağıdaki linkten 1 dakikada ücretsiz sorgulama yapabilirsiniz.
                  </p>

                  {/* CTA Button */}
                  <div className="my-8 text-center not-prose">
                    <Link
                      href="/teklif"
                      className="inline-block bg-primary-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
                    >
                      👉 Ücretsiz Değer Kaybı Hesaplama ve Teklif Formu
                    </Link>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Sıkça Sorulan Sorular
                  </h2>

                  <div className="space-y-6 mt-6">
                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Full kasko (Muafiyetsiz) yaptırdım, yine de değer kaybı öder miyim?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Eğer kiralama sırasında "Lastik, Cam, Far (LCF)" dahil tam güvence paketi satın aldıysanız ve sözleşmenizde "değer kaybı muafiyeti" maddesi varsa ödemezsiniz. Ancak standart kasko sadece hasarı öder, değer kaybını kapsamaz. Sözleşmenizi kontrol etmelisiniz.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Kiralama şirketi benden değer kaybı için senet istiyor, ne yapmalıyım?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Kurumsal firmalar genellikle kredi kartına bloke (provizyon) koyar. Açık senet imzalamak hukuki açıdan risklidir. Eğer hasar bedeli belliyse, sadece o tutar kadar ödeme yapmanız veya yasal süreci beklemeniz daha sağlıklıdır.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Kiralık araçla kaza yaptım, "Yatış Parası" yasal mı?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Evet, yasaldır. Ticari araçların (taksi, dolmuş, kiralık araç) kaza nedeniyle çalışamadığı günlerin geliri, kusurlu taraftan talep edilebilir. Rent a car firması, aracın o dönemdeki günlük kira bedeli üzerinden bu tutarı sizden isteyebilir.
                      </p>
                    </div>
                  </div>

                  {/* İçerik Denetimi Kutusu */}
                  <div className="my-8 not-prose bg-blue-50 border-l-4 border-primary-blue p-4 sm:p-6 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm sm:text-base text-dark-blue font-semibold mb-1">
                          İçerik Denetimi
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-700">
                          Bu içerik, Değer360 Hukuk Birimi tarafından {formatDate(reviewedDateString)} tarihinde yasal mevzuata uygunluk açısından denetlenmiştir.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </article>

      <PageCTASection />
    </main>
  );
}
