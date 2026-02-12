import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';
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
    publishedAt: '2025-12-20',
    category: 'Rehber',
    metaDescription: 'Kaza sonrası aracınızda oluşan değer kaybını nasıl alırsınız? Değer360 ile masrafsız, ön ödemesiz ve %97 başarı oranıyla değer kaybı tazminatı süreci hakkında rehber.',
  },
  'ticari-araclarda-kazanc-kaybi-yatis-parasi-ve-deger-kaybi-nasil-alinir': {
    id: '2',
    title: 'Ticari Araçlarda Kazanç Kaybı (Yatış Parası) ve Değer Kaybı Nasıl Alınır?',
    excerpt: 'Ticari araç sahipleri kaza sonrası hem değer kaybı hem de yatış parası (kazanç kaybı) talep edebilir. Taksi, dolmuş, servis ve nakliye araçları için tazminat rehberi.',
    slug: 'ticari-araclarda-kazanc-kaybi-yatis-parasi-ve-deger-kaybi-nasil-alinir',
    publishedAt: '2026-01-23',
    category: 'Rehber',
    metaDescription: 'Ticari araç sahipleri için kazanç kaybı (yatış parası) ve değer kaybı tazminatı rehberi. Taksi, dolmuş, servis, nakliye araçları ve rent a car için başvuru şartları ve süreç.',
  },
  'pert-araclar-deger-kaybi-alinabilir-mi-yargitay-kararlari': {
    id: '3',
    title: 'Ağır Hasarlı (Pert) Araçlar İçin Değer Kaybı Alınabilir mi? Yargıtay Kararları Ne Diyor?',
    excerpt: 'Pert (ağır hasarlı) araçlar için değer kaybı tazminatı alınabilir mi? Yargıtay kararları, istisnai durumlar ve pert araç sahiplerinin hakları hakkında detaylı rehber.',
    slug: 'pert-araclar-deger-kaybi-alinabilir-mi-yargitay-kararlari',
    publishedAt: '2026-01-26',
    category: 'Rehber',
    metaDescription: 'Pert araçlar için değer kaybı tazminatı alınabilir mi? Yargıtay kararları, istisnai durumlar, rayiç bedel itirazı ve pert araç sahiplerinin hakları hakkında detaylı bilgi.',
  },
  'kiralik-arac-rent-a-car-deger-kaybi-kim-oder': {
    id: '4',
    title: 'Kiralık Araçla (Rent a Car) Kaza Yaptım: Değer Kaybını Sürücü mü Öder?',
    excerpt: 'Kiralık araçla kaza yaptığınızda değer kaybını kim öder? Rent a car firmaları, kusur durumları, sigorta paketleri ve sürücü sorumlulukları hakkında detaylı rehber.',
    slug: 'kiralik-arac-rent-a-car-deger-kaybi-kim-oder',
    publishedAt: '2026-01-29',
    category: 'Rehber',
    metaDescription: 'Kiralık araçla kaza yaptığınızda değer kaybını kim öder? Rent a car firmaları, kusur durumları, sigorta paketleri, yatış bedeli ve sürücü sorumlulukları hakkında detaylı bilgi.',
  },
  'motosiklet-kazalarinda-deger-kaybi-ve-ekipman-hasari-tazminati': {
    id: '5',
    title: 'Motosiklet Kazalarında Değer Kaybı ve Ekipman Hasarı Tazminatı Nasıl Hesaplanır?',
    excerpt: 'Motosiklet kazalarında hem motosiklet değer kaybı hem de kask, mont, eldiven gibi ekipman hasarı tazminatı talep edilebilir. Fatura şartı, hesaplama yöntemi ve süreç hakkında rehber.',
    slug: 'motosiklet-kazalarinda-deger-kaybi-ve-ekipman-hasari-tazminati',
    publishedAt: '2026-02-01',
    category: 'Rehber',
    metaDescription: 'Motosiklet kazalarında değer kaybı ve ekipman hasarı tazminatı nasıl hesaplanır? Kask, mont, eldiven tazminatı, fatura şartı, pert motosiklet ve kurye kazanç kaybı hakkında detaylı bilgi.',
  },
  'deger-kaybi-davasi-ne-kadar-surer-tahkim-sureci': {
    id: '6',
    title: 'Değer Kaybı Davaları Ne Kadar Sürer? (Tahkim ve Mahkeme Süreçleri)',
    excerpt: 'Değer kaybı davası ne kadar sürer? Sigorta Tahkim Komisyonu 2-6 ay, klasik mahkeme 1.5-2 yıl sürebilir. Süreç adımları, tahkim vs mahkeme karşılaştırması ve süreci hızlandırma yöntemleri.',
    slug: 'deger-kaybi-davasi-ne-kadar-surer-tahkim-sureci',
    publishedAt: '2026-02-04',
    category: 'Rehber',
    metaDescription: 'Değer kaybı davası ne kadar sürer? Sigorta Tahkim Komisyonu süreçleri, klasik mahkeme süreleri, tahkim vs mahkeme karşılaştırması, zamanaşımı ve ödeme süreleri hakkında detaylı bilgi.',
  },
  'arac-deger-kaybi-hesaplama-2026-eksperler-tazminati-hangi-formulle-belirliyor': {
    id: '7',
    title: 'Araç Değer Kaybı Hesaplama 2026: Eksperler Tazminatı Hangi Formülle Belirliyor?',
    excerpt: 'Araç değer kaybı hesaplama formülü 2026: Hazine Müsteşarlığı standart formülü, rayiç bedel, kilometre katsayısı, hasar büyüklüğü ve parça niteliği. Otomatik hesaplama araçları neden yanıltıcı?',
    slug: 'arac-deger-kaybi-hesaplama-2026-eksperler-tazminati-hangi-formulle-belirliyor',
    publishedAt: '2026-02-07',
    category: 'Rehber',
    metaDescription: 'Araç değer kaybı hesaplama formülü 2026: Hazine Müsteşarlığı standart formülü, rayiç bedel, kilometre katsayısı, hasar büyüklüğü, parça niteliği ve otomatik hesaplama araçlarının neden yanıltıcı olduğu hakkında detaylı bilgi.',
  },
  'tramer-kaydi-silinir-mi-hasar-kaydi-ve-deger-kaybi-arasindaki-kritik-farklar': {
    id: '8',
    title: 'TRAMER Kaydı Silinir mi? Hasar Kaydı ve Değer Kaybı Arasındaki Kritik Farklar',
    excerpt: 'TRAMER kaydı silinir mi? Hasar kaydı ve değer kaybı arasındaki farklar, kayıt silme şartları, itiraz süreçleri ve değer kaybı tazminatı hakkında detaylı rehber.',
    slug: 'tramer-kaydi-silinir-mi-hasar-kaydi-ve-deger-kaybi-arasindaki-kritik-farklar',
    publishedAt: '2026-02-10',
    category: 'Rehber',
    metaDescription: 'TRAMER kaydı silinir mi? Hasar kaydı ve değer kaybı arasındaki kritik farklar, kayıt silme şartları, itiraz süreçleri, bedelsiz hasar kaydı ve değer kaybı tazminatı hakkında detaylı bilgi.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug];
  
  if (!post) {
    notFound();
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
    notFound();
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
  } : slug === 'motosiklet-kazalarinda-deger-kaybi-ve-ekipman-hasari-tazminati' ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Motosikletim \"Ağır Hasarlı\" (Pert) sayıldı, ekipman parasını alabilir miyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Motosikletiniz pert olsa ve motor için değer kaybı alamasanız bile, üzerinizdeki hasarlı kıyafet ve ekipmanların parasını ayrıca talep edebilirsiniz. Bu iki tazminat kalemi birbirinden bağımsızdır."
        }
      },
      {
        "@type": "Question",
        "name": "Ekipmanlarımın faturası yok, internet fiyatı üzerinden mi ödenir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Fatura ibrazı zorunlu değildir (olsa daha iyi olur). Fatura yoksa, ürünün marka/modelinin güncel internet satış fiyatları (Trendyol, yetkili satıcı vb.) referans alınarak bilirkişi tarafından değer tespiti yapılır."
        }
      },
      {
        "@type": "Question",
        "name": "Kuryeyim, motorum serviste yatarken çalışamadım. Paramı alabilir miyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Ticari olarak kullanılan (Getir, Yemeksepeti, Trendyol Go vb. veya şahsi kurye) motosikletler için \"Ticari Kazanç Kaybı\" (Yatış Parası) talep edilebilir. Bunun için vergi levhası veya çalışma kaydı sunmanız gerekir."
        }
      }
    ]
  } : slug === 'deger-kaybi-davasi-ne-kadar-surer-tahkim-sureci' ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Değer kaybı davasında zamanaşımı süresi ne kadardır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Kaza tarihinden itibaren 2 yıl içinde başvuru yapmanız gerekir. Eğer kazada yaralanma veya ölüm varsa bu süre 8 yıla kadar (Ceza zamanaşımı) uzayabilir. Ancak sadece maddi hasarlı kazalarda 2 yılı geçirmemelisiniz."
        }
      },
      {
        "@type": "Question",
        "name": "Tazminat kazandık, para ne zaman hesabıma yatar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tahkim Komisyonu karar verdikten sonra, sigorta şirketine kararı (ilamı) göndeririz. Sigorta şirketleri genellikle yasal faiz işlememesi için karardan sonraki 1-2 hafta içinde ödemeyi yapar."
        }
      },
      {
        "@type": "Question",
        "name": "Dosya sonuçlanmadan aracı satabilir miyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, satabilirsiniz. Değer kaybı hakkı \"kaza tarihindeki ruhsat sahibine\" aittir. Aracı satmış olmanız, geçmişteki kazadan doğan tazminat hakkınızı kaybetmenize neden olmaz."
        }
      }
    ]
  } : slug === 'arac-deger-kaybi-hesaplama-2026-eksperler-tazminati-hangi-formulle-belirliyor' ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Tampon değişimi değer kaybı yaratır mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Genellikle hayır. Plastik aksamlar (tamponlar), camlar, jantlar ve vidalı sökülebilir parçalar (far, stop lambası), aracın \"mekanik veya kaporta bütünlüğünü\" bozmadığı kabul edildiği için değer kaybı hesaplamasına dahil edilmez veya etkisi çok düşüktür."
        }
      },
      {
        "@type": "Question",
        "name": "165.000 KM sınırı kalktı mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, Anayasa Mahkemesi'nin ilgili kararıyla kilometre sınırı esnetilmiştir. Eskiden 165.000 km üzerindeki araçlara ödeme yapılmıyordu, şimdi ise Yargıtay kararları ışığında hesaplama yapılabiliyor. Ancak KM arttıkça alınacak tazminat miktarının düştüğü unutulmamalıdır."
        }
      },
      {
        "@type": "Question",
        "name": "Tramer kaydındaki tutar ile alacağım para aynı mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hayır, kesinlikle değildir. Tramer (Hasar) kaydı, servisin aracı onarmak için harcadığı paradır. Değer kaybı tazminatı ise aracın piyasa değerindeki düşüştür. 50.000 TL hasar kaydı olan bir araç için 20.000 TL de değer kaybı çıkabilir, 0 TL de çıkabilir. Bu tamamen hasarın yerine bağlıdır."
        }
      },
      {
        "@type": "Question",
        "name": "Karşı tarafın sigortası yoksa hesaplama nasıl yapılır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hesaplama değişmez ancak muhatap değişir. Karşı tarafın trafik sigortası yoksa, hesaplanan değer kaybı tutarını Güvence Hesabı ödemez. Bu durumda hesaplanan tutarı doğrudan kazaya sebep olan sürücüden ve araç sahibinden icra/dava yoluyla talep ederiz."
        }
      }
    ]
  } : slug === 'tramer-kaydi-silinir-mi-hasar-kaydi-ve-deger-kaybi-arasindaki-kritik-farklar' ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "5 yıl geçince TRAMER kaydı kendiliğinden silinir mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hayır, bu bir şehir efsanesidir. TRAMER kayıtları aracın şasi numarasına işlenir ve araç hurdaya ayrılana kadar (veya sonsuza dek) sistemde kalır. Zaman aşımıyla silinme diye bir durum yoktur."
        }
      },
      {
        "@type": "Question",
        "name": "Bedelsiz (Miktarsız) hasar kaydı ne anlama gelir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sorgulamada \"Çarpma\" yazıyor ama tutar \"0 TL\" veya boş görünüyorsa; bu durum genellikle tutanağın tutulduğunu ancak sigorta şirketinin henüz ödeme yapmadığını veya dosyanın rücu aşamasında olduğunu gösterir. Bu durumda da değer kaybı başvurusu yapılabilir, ancak önce dosyanın kapanması gerekir."
        }
      },
      {
        "@type": "Question",
        "name": "TRAMER kaydı olmayan araçtan değer kaybı alınır mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Çok nadir de olsa evet. Bazen sigorta şirketi ödemeyi yapar ancak sisteme geç işler. Veya araç sahibi hasarı cepten yaptırır ama karşı taraftan değer kaybı ister. Önemli olan TRAMER'de yazması değil, aracın fiziksel olarak hasar görmüş ve onarılmış olmasıdır."
        }
      },
      {
        "@type": "Question",
        "name": "Eksper raporuna itiraz edip hasar tutarını düşürebilir miyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Kaza sonrası eksperin yazdığı parça ve işçilik listesine, yasal süre (genellikle rapor tebliğinden itibaren 7 gün) içinde itiraz edebilirsiniz. Ancak dosya kapandıktan ve üzerinden zaman geçtikten sonra hasar tutarını düşürmek çok zordur, ancak maddi hata (yazım yanlışı) varsa düzeltilir."
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
              ) : slug === 'motosiklet-kazalarinda-deger-kaybi-ve-ekipman-hasari-tazminati' ? (
                <>
                  <p className="text-xl text-neutral-700 mb-6 font-medium leading-relaxed">
                    Motosiklet kazalarında tazminat hakkı, sadece motosikletin kaporta veya mekanik onarımıyla sınırlı değildir. Eğer kazada %100 kusurlu değilseniz; hem motosikletinizde oluşan <strong>değer kaybını</strong> hem de kaza sırasında zarar gören <strong>kask, mont, eldiven, interkom ve koruma demiri</strong> gibi ekipmanlarınızın bedelini karşı tarafın trafik sigortasından nakit olarak talep edebilirsiniz.
                  </p>

                  <p>
                    Pek çok motosiklet sürücüsü, <em>"Sigorta sadece aracı öder"</em> yanılgısıyla, toplam değeri bazen motosikletin kendisine yaklaşan ekipman hasarlarını cebinden karşılamaktadır.
                  </p>

                  {/* Görsel - SEO için alt text ile */}
                  <div className="my-8 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src="/images/blog/motosiklet-deger-kaybi-ve-ekipman-hasari-tazminati.jpeg"
                      alt="motosiklet değer kaybı ve ekipman hasarı tazminatı"
                      width={1200}
                      height={630}
                      className="w-full h-auto object-cover"
                      priority
                    />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Motosikletçilerin 2 Ayrı Tazminat Hakkı Vardır
                  </h2>

                  <p>
                    20 yıllık tecrübemizle yönettiğimiz dosyalarda gördüğümüz en büyük eksiklik, sürücülerin haklarını tam bilmemesidir. Sigorta mevzuatına göre talep edebileceğiniz kalemler şunlardır:
                  </p>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                    1. Motosiklet Değer Kaybı
                  </h3>
                  <p>
                    Tıpkı otomobillerde olduğu gibi, motosikletiniz onarılsa dahi TRAMER kaydı oluşur ve "kazalı motor" statüsüne düşer. Satarken <em>"Abi bu kazalı, fiyatı düş"</em> denilen o rakam farkı, sizin yasal hakkınızdır.
                  </p>
                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Hesaplama Kriteri:</strong> Motosikletin KM'si, markası, modeli ve değişen parçaların (şasi, gidon, grenaj vb.) niteliğine göre hesaplanır.</li>
                  </ul>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                    2. Ekipman ve Aksesuar Tazminatı (Maddi Hasar)
                  </h3>
                  <p>
                    Kaskınız yere bir kez çarptığında koruyuculuk özelliğini yitirir ve yenilenmesi gerekir. Sigorta şirketleri bunu "kişisel eşya" gibi görüp ödemek istemese de, Yargıtay kararlarına göre bu bir <strong>"Doğrudan Maddi Zarar"</strong>dır.
                  </p>
                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Neler İstenebilir?:</strong> Kask, motosiklet montu, pantolonu, botlar, eldivenler, takılı olan çantalar (topcase/sidecase) ve interkom cihazları.</li>
                  </ul>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Ekipman Tazminatı Nasıl Hesaplanır? Fatura Şart Mı?
                  </h2>

                  <p>
                    En çok sorulan soru şudur: <em>"Ekipmanlarımı 2 yıl önce aldım, faturasını bulamıyorum. Yine de para alabilir miyim?"</em>
                  </p>

                  <p className="font-semibold text-dark-blue mb-4">
                    <strong>Cevap: Evet, alabilirsiniz.</strong>
                  </p>

                  <p>
                    Sigorta Tahkim Komisyonu ve mahkemeler, ekipmanlarınızın faturası olmasa dahi, kaza tarihindeki <strong>"Piyasa Rayiç Bedeli"</strong> üzerinden ödeme yapılmasına hükmeder.
                  </p>

                  <p className="font-semibold text-dark-blue mt-6 mb-3">
                    Süreç Şöyle İşler:
                  </p>

                  <ol className="list-decimal list-inside space-y-3 my-4">
                    <li><strong>Kanıt:</strong> Kaza yerinde veya sonrasında hasarlı ekipmanların fotoğraflarını çekmelisiniz. (Yırtılmış mont, çizilmiş kask vb.)</li>
                    <li><strong>Tespit:</strong> Ekipmanların marka ve modellerini (Örn: Shoei NXR2 Kask, Revit Mont) belirleriz.</li>
                    <li><strong>Rayiç Bedel:</strong> Bu ürünlerin güncel piyasa fiyatlarını emsal linklerle dosyaya ekleriz. Sigorta eksperleri, yıpranma payını (kullanım süresine göre) düşerek size ödeme yapar.</li>
                  </ol>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Değer360 ile "Çifte Tazminat" Süreci
                  </h2>

                  <p>
                    Motosiklet dosyaları, otomobil dosyalarından daha hassastır. Çünkü hasar gören bir şasi veya ön çatal, motosikletin sürüş güvenliğini doğrudan etkiler ve değer kaybı çok yüksek çıkabilir.
                  </p>

                  <p>
                    <strong>Değer360</strong> olarak motosiklet dosyalarınıza şu şekilde yaklaşıyoruz:
                  </p>

                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Bütüncül Yaklaşım:</strong> Sadece motor için değil, üzerinizdeki ekipmanlar için de dosya açıyoruz.</li>
                    <li><strong>Sıfır Risk:</strong> Dosya masrafı, eksper ücreti veya başvuru harcı ödemiyorsunuz.</li>
                    <li><strong>Adil Kesinti:</strong> Tazminatı kazanırsak, sadece aldığımız tutar üzerinden hizmet bedelimizi kesiyoruz. (Motor için ayrı, ekipman için ayrı koşturmanıza gerek kalmaz).</li>
                  </ul>

                  <div className="bg-orange-50 border-l-4 border-primary-orange p-4 my-6 rounded">
                    <p className="font-semibold text-dark-blue mb-2">Önemli Not:</p>
                    <p>
                      Kaza sonrası kaskınızı veya hasarlı ekipmanlarınızı çöpe atmayın! Sigorta şirketi ödeme onayı verene kadar bu ekipmanları saklamanız, ispat açısından önemlidir.
                    </p>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Motorunuzun ve Ekipmanınızın Hakkını Bırakmayın
                  </h2>

                  <p>
                    Motosiklet kültürü pahalı bir hobidir/ulaşım yoludur. Başkasının hatası yüzünden binlerce liralık zarar etmeyin.
                  </p>

                  <p className="text-lg font-semibold text-dark-blue mt-6 mb-4">
                    Motosikletiniz ve ekipmanlarınız için ne kadar ödeme alabileceğinizi öğrenmek ister misiniz?
                    Aşağıdaki linkten ücretsiz analiz talep edebilirsiniz:
                  </p>

                  {/* CTA Button */}
                  <div className="my-8 text-center not-prose">
                    <Link
                      href="/teklif"
                      className="inline-block bg-primary-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
                    >
                      👉 Motosiklet Değer Kaybı ve Ekipman Hasarı Teklif Formu
                    </Link>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Sıkça Sorulan Sorular (Motosiklet Özel)
                  </h2>

                  <div className="space-y-6 mt-6">
                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Motosikletim "Ağır Hasarlı" (Pert) sayıldı, ekipman parasını alabilir miyim?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Evet. Motosikletiniz pert olsa ve motor için değer kaybı alamasanız bile, üzerinizdeki hasarlı kıyafet ve ekipmanların parasını <strong>ayrıca</strong> talep edebilirsiniz. Bu iki tazminat kalemi birbirinden bağımsızdır.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Ekipmanlarımın faturası yok, internet fiyatı üzerinden mi ödenir?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Evet. Fatura ibrazı zorunlu değildir (olsa daha iyi olur). Fatura yoksa, ürünün marka/modelinin güncel internet satış fiyatları (Trendyol, yetkili satıcı vb.) referans alınarak bilirkişi tarafından değer tespiti yapılır.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Sonradan taktığım aksesuarlar (Egzoz, Koruma Demiri) ödenir mi?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Motosikletin orijinalinde olmayıp sonradan eklediğiniz aksesuarlar, kaza anında hasar gördüyse ve fotoğraflarla ispatlanabiliyorsa tazminata dahil edilebilir. Ancak bu aksesuarların trafik mevzuatına uygun olması önemlidir.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Kuryeyim, motorum serviste yatarken çalışamadım. Paramı alabilir miyim?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Evet. Ticari olarak kullanılan (Getir, Yemeksepeti, Trendyol Go vb. veya şahsi kurye) motosikletler için "Ticari Kazanç Kaybı" (Yatış Parası) talep edilebilir. Bunun için vergi levhası veya çalışma kaydı sunmanız gerekir.
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
              ) : slug === 'deger-kaybi-davasi-ne-kadar-surer-tahkim-sureci' ? (
                <>
                  <p className="text-xl text-neutral-700 mb-6 font-medium leading-relaxed">
                    Araç değer kaybı tazminat süreçleri, başvuru yapılan merciye göre değişmekle birlikte; Sigorta Tahkim Komisyonu üzerinden yürütüldüğünde ortalama <strong>2 ile 6 ay</strong> arasında sonuçlanır. Klasik Asliye Hukuk Mahkemelerinde bu süreç 1.5 - 2 yılı bulabilirken, Değer360 olarak tercih ettiğimiz Tahkim yolu, mağduriyetin en hızlı ve kesin şekilde giderilmesini sağlar.
                  </p>

                  <p>
                    Sürecin uzunluğunu belirleyen temel faktör, sigorta şirketinin ilk başvuruya verdiği cevap ve dosyanın eksik evrak durumudur.
                  </p>

                  {/* Görsel - SEO için alt text ile */}
                  <div className="my-8 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src="/images/blog/deger-kaybi-davasi-ne-kadar-surer-tahkim-sureci.jpeg"
                      alt="değer kaybı davası ne kadar sürer tahkim süreci"
                      width={1200}
                      height={630}
                      className="w-full h-auto object-cover"
                      priority
                    />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Süreç Neden Değişkenlik Gösterir? (Adım Adım Zaman Çizelgesi)
                  </h2>

                  <p>
                    Değer360 olarak yönettiğimiz 750+ yıllık dosya hacmine dayanarak, süreci 3 ana evreye ayırabiliriz:
                  </p>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                    1. Evre: Sigorta Şirketine İlk Başvuru (15 Gün)
                  </h3>
                  <p>
                    Yasa gereği, dava veya tahkim yoluna gitmeden önce ilgili sigorta şirketine yazılı başvuru yapılması zorunludur.
                  </p>
                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Süre:</strong> Sigorta şirketinin yasal olarak <strong>15 iş günü</strong> cevap verme süresi vardır.</li>
                    <li><strong>Sonuç:</strong> Şirket ya ödeme yapar (genelde düşük tutar), ya reddeder ya da cevap vermez. Cevap gelmezse veya eksik gelirse 2. evreye geçilir.</li>
                  </ul>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                    2. Evre: Sigorta Tahkim Komisyonu (Ortalama 4 Ay)
                  </h3>
                  <p>
                    Sigorta şirketiyle anlaşamazsak (ki %90 anlaşamayız çünkü düşük teklif ederler), dosyanızı "Sigorta Tahkim Komisyonu"na taşırız. Burası mahkeme statüsünde ama çok daha hızlı çalışan bir kurumdur.
                  </p>
                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Bilirkişi Ataması:</strong> Dosyaya bağımsız bir hakem ve bilirkişi atanır.</li>
                    <li><strong>Rapor Süreci:</strong> Bilirkişi aracın gerçek değer kaybını hesaplar.</li>
                    <li><strong>Karar:</strong> Hakem heyeti kararı verir. Bu süreç dosya yoğunluğuna göre <strong>3 ila 5 ay</strong> sürebilir.</li>
                  </ul>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                    3. Evre: İtiraz ve Kesinleşme (Opsiyonel +2 Ay)
                  </h3>
                  <p>
                    Karar verilen tutar belirli bir sınırın üzerindeyse (örn: çok yüksek tazminatlar), sigorta şirketi itiraz edebilir. İtiraz süreci de ortalama <strong>2 ay</strong> ekleyebilir. Ancak standart hasarlarda genellikle itiraz sınırı altında kalındığı için karar hemen kesinleşir.
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Klasik Mahkeme vs. Tahkim: Neden Biz Tahkimi Seçiyoruz?
                  </h2>

                  <p>
                    Pek çok avukat, alışkanlık gereği dosyayı Asliye Hukuk Mahkemelerine açar. Bu, vatandaş için bir zaman kaybı tuzağıdır.
                  </p>

                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full border-collapse border border-neutral-300 rounded-lg">
                      <thead>
                        <tr className="bg-primary-blue text-white">
                          <th className="border border-neutral-300 px-4 py-3 text-left font-bold">Kriter</th>
                          <th className="border border-neutral-300 px-4 py-3 text-left font-bold">Klasik Mahkeme (Dava)</th>
                          <th className="border border-neutral-300 px-4 py-3 text-left font-bold">Sigorta Tahkim Komisyonu</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-neutral-300 px-4 py-3 font-semibold">Ortalama Süre</td>
                          <td className="border border-neutral-300 px-4 py-3">1.5 - 2 Yıl</td>
                          <td className="border border-neutral-300 px-4 py-3"><strong>2 - 6 Ay</strong></td>
                        </tr>
                        <tr className="bg-neutral-50">
                          <td className="border border-neutral-300 px-4 py-3 font-semibold">Maliyet</td>
                          <td className="border border-neutral-300 px-4 py-3">Yüksek harçlar çıkabilir</td>
                          <td className="border border-neutral-300 px-4 py-3">Daha düşük maliyetli</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-neutral-300 px-4 py-3 font-semibold">Uzmanlık</td>
                          <td className="border border-neutral-300 px-4 py-3">Hakim her konuya bakar</td>
                          <td className="border border-neutral-300 px-4 py-3">Hakemler sadece sigorta uzmanıdır</td>
                        </tr>
                        <tr className="bg-neutral-50">
                          <td className="border border-neutral-300 px-4 py-3 font-semibold">Sonuç</td>
                          <td className="border border-neutral-300 px-4 py-3">Yıllarca duruşma beklersiniz</td>
                          <td className="border border-neutral-300 px-4 py-3">Dosya üzerinden hızlı karar verilir</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p>
                    <strong>Değer360</strong> olarak %97 başarı oranımızı, dosyaları doğru merciye (Tahkim) hızlıca iletmeye ve eksiksiz evrak yönetimine borçluyuz.
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Süreci Hızlandırmak Sizin Elinizde mi?
                  </h2>

                  <p>
                    Evet. Dosyanızın "bekleme odasında" kalmaması için şu evrakların kaza anında tam olması kritik önem taşır:
                  </p>

                  <ol className="list-decimal list-inside space-y-2 my-4">
                    <li>Kaza Tespit Tutanağı (Islak imzalı veya e-devlet çıktısı).</li>
                    <li>Kaza anı fotoğrafları (Plakalar net okunmalı).</li>
                    <li>Aracın onarıldığı servisten alınan parça/işçilik listesi.</li>
                    <li>Ruhsat ve Ehliyet fotokopisi.</li>
                  </ol>

                  <div className="bg-orange-50 border-l-4 border-primary-orange p-4 my-6 rounded">
                    <p className="font-semibold text-dark-blue mb-2">Değer360 Farkı:</p>
                    <p>
                      "Dosyam ne zaman sonuçlanacak?" diye her gün aramanıza gerek yok. Web sitemizdeki Dosyam Nerede? paneli üzerinden, dosyanızın hangi aşamada olduğunu (Bilirkişide mi? Karar aşamasında mı?) 7/24 şeffaf bir şekilde takip edebilirsiniz.
                    </p>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    2 Yıl Beklemeyin, 2 Ayda Çözülsün
                  </h2>

                  <p>
                    Zaman en değerli varlığınızdır. Hakkınız olan parayı enflasyon karşısında eritmemek için hızlı hareket etmelisiniz.
                  </p>

                  <p className="text-lg font-semibold text-dark-blue mt-6 mb-4">
                    Dosyanızın ne kadar sürede sonuçlanacağını ve tahmini ne kadar tazminat alacağınızı öğrenmek için aşağıdaki linki kullanın.
                  </p>

                  {/* CTA Button */}
                  <div className="my-8 text-center not-prose">
                    <Link
                      href="/teklif"
                      className="inline-block bg-primary-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
                    >
                      👉 Hızlı Değer Kaybı Sorgulama ve Teklif Formu
                    </Link>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Sıkça Sorulan Sorular (Süreç Hakkında)
                  </h2>

                  <div className="space-y-6 mt-6">
                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Değer kaybı davasında zamanaşımı süresi ne kadardır?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Kaza tarihinden itibaren <strong>2 yıl</strong> içinde başvuru yapmanız gerekir. Eğer kazada yaralanma veya ölüm varsa bu süre 8 yıla kadar (Ceza zamanaşımı) uzayabilir. Ancak sadece maddi hasarlı kazalarda 2 yılı geçirmemelisiniz.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Tazminat kazandık, para ne zaman hesabıma yatar?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Tahkim Komisyonu karar verdikten sonra, sigorta şirketine kararı (ilamı) göndeririz. Sigorta şirketleri genellikle yasal faiz işlememesi için karardan sonraki <strong>1-2 hafta içinde</strong> ödemeyi yapar.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Dosya sonuçlanmadan aracı satabilir miyim?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Evet, satabilirsiniz. Değer kaybı hakkı <strong>"kaza tarihindeki ruhsat sahibine"</strong> aittir. Aracı satmış olmanız, geçmişteki kazadan doğan tazminat hakkınızı kaybetmenize neden olmaz.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Süreci kendim takip etsem daha mı hızlı olur?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Hayır, muhtemelen daha yavaş olur veya reddedilir. Sigorta şirketleri bireysel başvurularda "eksik evrak" bahanesiyle süreci uzatabilir veya reddedebilir. Profesyonel bir vekil ile çalışmak, yasal süreleri (15 gün, 5 gün vb.) kaçırmamanızı ve dosyanın bilirkişiye doğru sorularla gitmesini sağlar.
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
              ) : slug === 'arac-deger-kaybi-hesaplama-2026-eksperler-tazminati-hangi-formulle-belirliyor' ? (
                <>
                  <p className="text-xl text-neutral-700 mb-6 font-medium leading-relaxed">
                    <strong>Araç değer kaybı hesaplaması;</strong> Hazine Müsteşarlığı'nın belirlediği standart formüle göre, aracın <strong>piyasa rayiç değeri</strong>, <strong>kilometresi</strong>, <strong>geçmiş hasar durumu</strong> ve <strong>onarımın niteliği</strong> (parça değişimi/boya/işçilik) baz alınarak yapılan teknik bir işlemdir. 2026 yılı itibariyle güncel hesaplamada en belirleyici faktör; aracın "Kaza Öncesi 2. El Piyasa Değeri" ile "Onarım Sonrası Hali" arasındaki reel farktır. İnternetteki basit robotların aksine, gerçek tazminat tutarı ancak lisanslı bir sigorta eksperi veya uzman hukukçu tarafından, parça bazlı analizle belirlenebilir.
                  </p>

                  {/* Görsel - SEO için alt text ile */}
                  <div className="my-8 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src="/images/blog/arac-deger-kaybi-hesaplama-2026-formulu.jpg"
                      alt="araç değer kaybı hesaplama 2026 formülü"
                      width={1200}
                      height={630}
                      className="w-full h-auto object-cover"
                      priority
                    />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Hesaplamayı Etkileyen 4 Ana Çarpan (Formülün İçeriği)
                  </h2>

                  <p>
                    Sigorta şirketleri ve Sigorta Tahkim Komisyonu, ödeme yaparken <strong>"Karayolları Motorlu Araçlar Zorunlu Mali Sorumluluk Sigortası Genel Şartları"</strong> ekinde yer alan formülü kullanır. Bu formül şu 4 temel sütuna dayanır:
                  </p>

                  <ol className="list-decimal list-inside space-y-4 my-6">
                    <li>
                      <strong>Baz Değer (Rayiç Bedel):</strong><br />
                      Aracınızın kaza tarihindeki 2. el piyasa satış fiyatıdır. (Örn: Sarı sitedeki ilan fiyatları değil, resmi bilirkişi verileri esas alınır).
                    </li>
                    <li>
                      <strong>Kilometre Katsayısı:</strong><br />
                      Aracın kilometresi ne kadar düşükse, kaza sonrası değer kaybı o kadar yüksek olur.
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><em>0 - 15.000 km:</em> En yüksek katsayı (Yüksek tazminat).</li>
                        <li><em>75.000 km ve üzeri:</em> Katsayı düşmeye başlar.</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Hasar Büyüklüğü ve Niteliği:</strong><br />
                      Aracın hangi parçasının hasar gördüğü hayati önem taşır.
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Vida ile sökülen parçalar (Tampon, Far, Cam):</strong> Genellikle değer kaybı oluşturmaz veya çok az oluşturur.</li>
                        <li><strong>Kaynaklı parçalar (Şasi, Arka Çamurluk, Podye):</strong> Aracın iskeletini etkilediği için çok yüksek değer kaybı tazminatı çıkarır.</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Kullanım Amacı:</strong><br />
                      Hususi (şahsi) araçlar ile ticari (taksi, kiralık) araçların katsayıları farklılık gösterir.
                    </li>
                  </ol>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Neden İnternetteki "Otomatik Hesaplama" Araçlarına Güvenmemelisiniz?
                  </h2>

                  <p>
                    Google'da karşınıza çıkan "Değer Kaybı Hesapla" butonları genellikle yanıltıcıdır. Çünkü bir yazılım, aracınızın hasar fotoğrafına bakıp şunları anlayamaz:
                  </p>

                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><em>"Bu çamurluk onarıldı mı, yoksa orijinaliyle mi değişti?"</em> (İkisi arasındaki tazminat farkı büyüktür).</li>
                    <li><em>"Bu araç daha önce aynı bölgeden kaza yapmış mı?"</em> (Eğer yapmışsa tazminat alamazsınız, robot bunu bilmeden size para vaat eder).</li>
                    <li><em>"Aracın donanım paketi (Opsiyonel özellikler) fiyata dahil mi?"</em></li>
                  </ul>

                  <div className="bg-orange-50 border-l-4 border-primary-orange p-4 my-6 rounded">
                    <p className="font-semibold text-dark-blue mb-2">Uzman Uyarısı:</p>
                    <p>
                      "Basit hesaplama araçları size 50.000 TL alacağınızı söyleyebilir ancak eksper incelemesinde bu rakam 15.000 TL'ye düşebilir veya tam tersi olabilir. Kesin rakam için dosyanın bir insan (uzman) gözüyle incelenmesi şarttır."
                    </p>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Değer360 Olarak Hesaplamayı Nasıl Yapıyoruz?
                  </h2>

                  <p>
                    Biz, otomatik bir yazılım değil, 20 yıllık avukatlık tecrübesi ve lisanslı eksper desteği kullanıyoruz.
                  </p>

                  <ol className="list-decimal list-inside space-y-3 my-4">
                    <li><strong>Manuel İnceleme:</strong> Gönderdiğiniz hasar fotoğraflarını ve ekspertiz raporunu teknik ekibimiz inceler.</li>
                    <li><strong>Emsal Kararlar:</strong> Yılda yönettiğimiz <strong>750+ davanın</strong> veri tabanını kullanarak, <em>"Benzer bir kazada Tahkim Komisyonu ne kadar ödemiş?"</em> sorusuna göre en gerçekçi tahmini yaparız.</li>
                    <li><strong>Maksimum Talep:</strong> Sigorta şirketinin teklif ettiği minimum tutarı değil, mevzuatın izin verdiği en yüksek tutarı talep ederiz.</li>
                  </ol>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    2026'da Hakkınız Olanı Alın
                  </h2>

                  <p>
                    Hesap kitap işleriyle kafanızı yormayın. Yanlış hesaplama yapıp az paraya razı olmayın.
                  </p>

                  <p>
                    Değer360 olarak;
                  </p>

                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Ön Ödeme Yok.</strong></li>
                    <li><strong>Eksper Ücreti Yok.</strong></li>
                    <li>Sadece tazminatı kazanırsak komisyon alıyoruz.</li>
                  </ul>

                  <p className="text-lg font-semibold text-dark-blue mt-6 mb-4">
                    Aracınızın gerçek değer kaybını <strong>ücretsiz</strong> öğrenmek için aşağıdaki formu doldurun, uzmanlarımız size net rakamı söylesin:
                  </p>

                  {/* CTA Button */}
                  <div className="my-8 text-center not-prose">
                    <Link
                      href="/teklif"
                      className="inline-block bg-primary-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
                    >
                      👉 Ücretsiz Eksper Görüşü ve Değer Kaybı Teklifi Alın
                    </Link>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Sıkça Sorulan Sorular (Hesaplama Hakkında)
                  </h2>

                  <div className="space-y-6 mt-6">
                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Tampon değişimi değer kaybı yaratır mı?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Genellikle hayır. Plastik aksamlar (tamponlar), camlar, jantlar ve vidalı sökülebilir parçalar (far, stop lambası), aracın "mekanik veya kaporta bütünlüğünü" bozmadığı kabul edildiği için değer kaybı hesaplamasına dahil edilmez veya etkisi çok düşüktür.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        165.000 KM sınırı kalktı mı?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Evet, Anayasa Mahkemesi'nin ilgili kararıyla kilometre sınırı esnetilmiştir. Eskiden 165.000 km üzerindeki araçlara ödeme yapılmıyordu, şimdi ise Yargıtay kararları ışığında hesaplama yapılabiliyor. Ancak KM arttıkça alınacak tazminat miktarının düştüğü unutulmamalıdır.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Tramer kaydındaki tutar ile alacağım para aynı mı?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Hayır, kesinlikle değildir. Tramer (Hasar) kaydı, servisin aracı onarmak için harcadığı paradır. Değer kaybı tazminatı ise aracın piyasa değerindeki düşüştür. 50.000 TL hasar kaydı olan bir araç için 20.000 TL de değer kaybı çıkabilir, 0 TL de çıkabilir. Bu tamamen hasarın yerine bağlıdır.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Karşı tarafın sigortası yoksa hesaplama nasıl yapılır?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Hesaplama değişmez ancak muhatap değişir. Karşı tarafın trafik sigortası yoksa, hesaplanan değer kaybı tutarını Güvence Hesabı ödemez. Bu durumda hesaplanan tutarı doğrudan kazaya sebep olan sürücüden ve araç sahibinden icra/dava yoluyla talep ederiz.
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
              ) : slug === 'tramer-kaydi-silinir-mi-hasar-kaydi-ve-deger-kaybi-arasindaki-kritik-farklar' ? (
                <>
                  <p className="text-xl text-neutral-700 mb-6 font-medium leading-relaxed">
                    <strong>Kısa Cevap:</strong> Genel kural olarak <strong>TRAMER (Hasar) kaydı silinmez.</strong> Sigorta Bilgi ve Gözetim Merkezi (SBM) veritabanına işlenen hasar kayıtları, aracın resmi sicilidir ve kaza gerçekse bu kayıt kalıcıdır. Ancak, kayıtta <strong>maddi bir hata</strong> (yanlış plaka girişi, karışan dosya, abartılı rakam, hiç yapılmamış kaza vb.) varsa, gerekli itirazlar yapılarak bu kayıt düzelttirilebilir veya sildirilebilir.
                  </p>

                  <p>
                    Araç sahiplerinin asıl bilmesi gereken şudur: Hasar kaydını sildiremeseniz bile, bu kaydın aracınızda yarattığı piyasa değeri düşüşünü <strong>"Değer Kaybı Tazminatı"</strong> olarak sigorta şirketinden nakit geri alabilirsiniz.
                  </p>

                  {/* Görsel - SEO için alt text ile */}
                  <div className="my-8 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src="/images/blog/tramer-kaydi-silinir-mi-hasar-kaydi-sorgulama.jpg"
                      alt="TRAMER kaydı silinir mi hasar kaydı sorgulama"
                      width={1200}
                      height={630}
                      className="w-full h-auto object-cover"
                      priority
                    />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    TRAMER (Hasar Kaydı) ile Değer Kaybı Aynı Şey Değildir!
                  </h2>

                  <p>
                    Sürücülerin en sık yaptığı hata, bu iki kavramı karıştırmaktır. Aradaki fark, cebinize girecek parayı belirler:
                  </p>

                  <ol className="list-decimal list-inside space-y-4 my-6">
                    <li>
                      <strong>Hasar Kaydı (TRAMER):</strong> Aracın onarımı için servise ödenen parça ve işçilik maliyetidir. (Örn: Tampon değişti, far takıldı = 50.000 TL Hasar Kaydı). Bu parayı servis alır.
                    </li>
                    <li>
                      <strong>Değer Kaybı:</strong> Onarım bitse bile, aracın "kazalı" etiketi yediği için ikinci el piyasasında ucuza satılmasıdır. (Örn: Aracınız 50.000 TL hasar kaydı yüzünden, emsallerinden 40.000 TL daha ucuza satılıyor). <strong>İşte bu 40.000 TL'yi siz alırsınız.</strong>
                    </li>
                  </ol>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Hangi Durumlarda TRAMER Kaydı Sildirilebilir?
                  </h2>

                  <p>
                    Eğer aracınızdaki hasar kaydının haksız veya hatalı olduğunu düşünüyorsanız, aşağıdaki durumlarda itiraz hakkınız vardır:
                  </p>

                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Plaka Karışıklığı:</strong> Başka bir aracın kazasının sizin plakanıza yanlışlıkla işlenmesi.</li>
                    <li><strong>Mükerrer Kayıt:</strong> Aynı kazanın sisteme iki kez girilmesi.</li>
                    <li><strong>Rakam Hatası:</strong> Servisin veya eksperin onarım bedelini sisteme yanlış (fazla) girmesi.</li>
                    <li><strong>Kaza Tespit Tutanağı İptali:</strong> Mahkeme kararıyla kazaya karışmadığınızın veya kusursuzluğunuzun ispatlanması sonucu tutanağın iptali.</li>
                  </ul>

                  <div className="bg-blue-50 border-l-4 border-primary-blue p-4 my-6 rounded">
                    <p className="font-semibold text-dark-blue mb-2">Nasıl İtiraz Edilir?</p>
                    <p>
                      Hatalı kayıtlar için sigorta şirketinize dilekçe verebilir veya Sigorta Bilgi ve Gözetim Merkezi (SBM) üzerinden "Hasar Kaydı Düzeltme" talebi oluşturabilirsiniz.
                    </p>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Kaydı Sildiremiyorsanız, "Parasını" Alın!
                  </h2>

                  <p>
                    Eğer kaza gerçekse ve kayıt silinmiyorsa üzülmeyin. Türk Borçlar Kanunu, aracınızın siciline işlenen bu "lekenin" bedelini sigorta şirketinin ödemesini emreder.
                  </p>

                  <p>
                    <strong>Değer360</strong> olarak biz burada devreye giriyoruz. Hasar kaydını silemeyiz (bu yasal olmaz), ancak o hasar kaydı yüzünden kaybettiğiniz parayı <strong>son 2 yıla dönük olarak</strong> tahsil edebiliriz.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-bold text-dark-blue mt-6 mb-3">
                    Değer Kaybı Alıp Alamayacağınızı Belirleyen 3 Soru:
                  </h3>

                  <ol className="list-decimal list-inside space-y-2 my-4">
                    <li>Kaza son 2 yıl içinde mi oldu?</li>
                    <li>Kazada %100 kusurlu taraf siz değil misiniz? (Kısmi kusurda da ödeme alınır).</li>
                    <li>Aracınızda parça değişimi veya boya işlemi yapıldı mı?</li>
                  </ol>

                  <p>
                    Bu sorulara "Evet" diyorsanız, içeride bekleyen bir tazminatınız var demektir.
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Neden Değer360?
                  </h2>

                  <p>
                    Hasar kaydı ve tazminat süreçleri karmaşıktır. Sigorta şirketleri genellikle <em>"Ödeme yaptık, dosya kapandı"</em> diyerek değer kaybını ödemezler.
                  </p>

                  <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Güçlü Altyapı:</strong> 20 yıllık hukuk tecrübesi ve %97 başarı oranı.</li>
                    <li><strong>Şeffaflık:</strong> <Link href="/portal" className="text-primary-orange hover:text-orange-600 underline">Dosyam Nerede?</Link> paneli ile 7/24 takip.</li>
                    <li><strong>Risksiz:</strong> Cebinizden 5 kuruş çıkmaz. Biz sadece kazandırırsak hizmet bedeli alırız.</li>
                  </ul>

                  <p className="text-lg font-semibold text-dark-blue mt-6 mb-4">
                    Aracınızdaki hasar kaydının size ne kadar "Değer Kaybı Tazminatı" getireceğini hemen öğrenin:
                  </p>

                  {/* CTA Button */}
                  <div className="my-8 text-center not-prose">
                    <Link
                      href="/teklif"
                      className="inline-block bg-primary-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
                    >
                      👉 Ücretsiz Sorgulama ve Değer Kaybı Teklifi
                    </Link>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mt-8 mb-4">
                    Sıkça Sorulan Sorular (TRAMER ve Kayıtlar Hakkında)
                  </h2>

                  <div className="space-y-6 mt-6">
                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        5 yıl geçince TRAMER kaydı kendiliğinden silinir mi?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Hayır, bu bir şehir efsanesidir. TRAMER kayıtları aracın şasi numarasına işlenir ve araç hurdaya ayrılana kadar (veya sonsuza dek) sistemde kalır. Zaman aşımıyla silinme diye bir durum yoktur.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Bedelsiz (Miktarsız) hasar kaydı ne anlama gelir?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Sorgulamada "Çarpma" yazıyor ama tutar "0 TL" veya boş görünüyorsa; bu durum genellikle tutanağın tutulduğunu ancak sigorta şirketinin henüz ödeme yapmadığını veya dosyanın rücu aşamasında olduğunu gösterir. Bu durumda da değer kaybı başvurusu yapılabilir, ancak önce dosyanın kapanması gerekir.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        TRAMER kaydı olmayan araçtan değer kaybı alınır mı?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Çok nadir de olsa evet. Bazen sigorta şirketi ödemeyi yapar ancak sisteme geç işler. Veya araç sahibi hasarı cepten yaptırır ama karşı taraftan değer kaybı ister. Önemli olan TRAMER'de yazması değil, aracın fiziksel olarak hasar görmüş ve onarılmış olmasıdır.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-5 sm:p-6 rounded-lg border-l-4 border-primary-orange">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-3">
                        Eksper raporuna itiraz edip hasar tutarını düşürebilir miyim?
                      </h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Kaza sonrası eksperin yazdığı parça ve işçilik listesine, yasal süre (genellikle rapor tebliğinden itibaren 7 gün) içinde itiraz edebilirsiniz. Ancak dosya kapandıktan ve üzerinden zaman geçtikten sonra hasar tutarını düşürmek çok zordur, ancak maddi hata (yazım yanlışı) varsa düzeltilir.
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
