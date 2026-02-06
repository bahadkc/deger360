import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { BlogCard, BlogPost } from '@/components/sections/blog-card';
import { ScrollAnimation } from '@/components/ui/scroll-animation';

// Dynamically import non-critical below-the-fold components to reduce initial bundle size
// Mobile-optimized: More aggressive lazy loading
const PageCTASection = dynamic(
  () => import('@/components/sections/page-cta-section').then((mod) => ({ default: mod.PageCTASection })),
  { 
    ssr: true,
    loading: () => null, // No loading state to prevent layout shift on mobile
  }
);

export const metadata: Metadata = {
  title: 'Blog - Araç Değer Kaybı Hakkında Bilgiler',
  description: 'Araç değer kaybı, tazminat süreçleri, sigorta hakları ve daha fazlası hakkında güncel bilgiler ve makaleler.',
};

// Blog yazıları
const samplePosts: BlogPost[] = [
  {
    id: '1',
    title: 'Kaza Yaptım, Şimdi Ne Olacak? Aracınızdaki "Gizli Parayı" (Değer Kaybını) Nasıl Geri Alırsınız?',
    excerpt: 'Kaza sonrası aracınızda oluşan değer kaybını nasıl alırsınız? Değer360 ile masrafsız, ön ödemesiz ve %97 başarı oranıyla değer kaybı tazminatı süreci hakkında rehber.',
    slug: 'kaza-yaptim-simdi-ne-olacak-aracinizdaki-gizli-parayi-deger-kaybini-nasil-geri-alirsiniz',
    publishedAt: '2024-12-20',
    category: 'Rehber',
    imageUrl: '/images/blog/kaza-sonrasi-yapilacaklar-deger-kaybi-basvurusu.jpg',
  },
  {
    id: '2',
    title: 'Ticari Araçlarda Kazanç Kaybı (Yatış Parası) ve Değer Kaybı Nasıl Alınır?',
    excerpt: 'Ticari araç sahipleri kaza sonrası hem değer kaybı hem de yatış parası (kazanç kaybı) talep edebilir. Taksi, dolmuş, servis ve nakliye araçları için tazminat rehberi.',
    slug: 'ticari-araclarda-kazanc-kaybi-yatis-parasi-ve-deger-kaybi-nasil-alinir',
    publishedAt: '2025-01-26',
    category: 'Rehber',
    imageUrl: '/images/blog/ticari-arac-yatis-parasi-kazanc-kaybi-tazminati.jpg',
  },
  {
    id: '3',
    title: 'Ağır Hasarlı (Pert) Araçlar İçin Değer Kaybı Alınabilir mi? Yargıtay Kararları Ne Diyor?',
    excerpt: 'Pert (ağır hasarlı) araçlar için değer kaybı tazminatı alınabilir mi? Yargıtay kararları, istisnai durumlar ve pert araç sahiplerinin hakları hakkında detaylı rehber.',
    slug: 'pert-araclar-deger-kaybi-alinabilir-mi-yargitay-kararlari',
    publishedAt: '2025-01-26',
    category: 'Rehber',
    imageUrl: '/images/blog/agir-hasarli-pert-arac-deger-kaybi-yargitay-kararlari.jpg',
  },
  {
    id: '4',
    title: 'Kiralık Araçla (Rent a Car) Kaza Yaptım: Değer Kaybını Sürücü mü Öder?',
    excerpt: 'Kiralık araçla kaza yaptığınızda değer kaybını kim öder? Rent a car firmaları, kusur durumları, sigorta paketleri ve sürücü sorumlulukları hakkında detaylı rehber.',
    slug: 'kiralik-arac-rent-a-car-deger-kaybi-kim-oder',
    publishedAt: '2025-01-26',
    category: 'Rehber',
    imageUrl: '/images/blog/kiralik-arac-rent-a-car-deger-kaybi-kim-oder.jpeg',
  },
  {
    id: '5',
    title: 'Motosiklet Kazalarında Değer Kaybı ve Ekipman Hasarı Tazminatı Nasıl Hesaplanır?',
    excerpt: 'Motosiklet kazalarında hem motosiklet değer kaybı hem de kask, mont, eldiven gibi ekipman hasarı tazminatı talep edilebilir. Fatura şartı, hesaplama yöntemi ve süreç hakkında rehber.',
    slug: 'motosiklet-kazalarinda-deger-kaybi-ve-ekipman-hasari-tazminati',
    publishedAt: '2025-01-26',
    category: 'Rehber',
    imageUrl: '/images/blog/motosiklet-deger-kaybi-ve-ekipman-hasari-tazminati.jpeg',
  },
  {
    id: '6',
    title: 'Değer Kaybı Davaları Ne Kadar Sürer? (Tahkim ve Mahkeme Süreçleri)',
    excerpt: 'Değer kaybı davası ne kadar sürer? Sigorta Tahkim Komisyonu 2-6 ay, klasik mahkeme 1.5-2 yıl sürebilir. Süreç adımları, tahkim vs mahkeme karşılaştırması ve süreci hızlandırma yöntemleri.',
    slug: 'deger-kaybi-davasi-ne-kadar-surer-tahkim-sureci',
    publishedAt: '2025-01-26',
    category: 'Rehber',
    imageUrl: '/images/blog/deger-kaybi-davasi-ne-kadar-surer-tahkim-sureci.jpeg',
  },
  {
    id: '7',
    title: 'Araç Değer Kaybı Hesaplama 2026: Eksperler Tazminatı Hangi Formülle Belirliyor?',
    excerpt: 'Araç değer kaybı hesaplama formülü 2026: Hazine Müsteşarlığı standart formülü, rayiç bedel, kilometre katsayısı, hasar büyüklüğü ve parça niteliği. Otomatik hesaplama araçları neden yanıltıcı?',
    slug: 'arac-deger-kaybi-hesaplama-2026-eksperler-tazminati-hangi-formulle-belirliyor',
    publishedAt: '2025-01-26',
    category: 'Rehber',
    imageUrl: '/images/blog/arac-deger-kaybi-hesaplama-2026-formulu.jpg',
  },
];

export default function BlogPage() {
  // Şimdilik boş postları filtrele
  const publishedPosts = samplePosts.filter(post => post.title && post.slug);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark-blue to-blue-900 text-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Blog
              </h1>
              <p className="text-lg sm:text-xl text-neutral-200">
                Araç değer kaybı, tazminat süreçleri ve sigorta hakları hakkında güncel bilgiler
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6">
          {publishedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {publishedPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-600 text-lg mb-4">
                Yakında yeni blog yazıları eklenecek...
              </p>
              <p className="text-neutral-500">
                Araç değer kaybı hakkında güncel bilgiler ve makaleler için bizi takip edin.
              </p>
            </div>
          )}
        </div>
      </section>

      <PageCTASection />
    </main>
  );
}
