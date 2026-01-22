import type { Metadata } from 'next';
import { BlogCard, BlogPost } from '@/components/sections/blog-card';
import { PageCTASection } from '@/components/sections/page-cta-section';
import { ScrollAnimation } from '@/components/ui/scroll-animation';

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
    imageUrl: '/images/blog/blog_1.jpg',
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
