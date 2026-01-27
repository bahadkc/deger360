import Link from 'next/link';
import Image from 'next/image';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  imageUrl?: string;
  category?: string;
}

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
        {/* Resim */}
        <div className="relative h-64 w-full overflow-hidden bg-neutral-200">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-blue to-blue-900">
              <p className="text-white/50 text-sm">Görsel yok</p>
            </div>
          )}
          
          {/* Gradient overlay - alt kısımda */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Başlık - resmin üzerinde alt kısımda */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <h3 className="text-white text-lg sm:text-xl font-bold line-clamp-2 drop-shadow-lg">
              {post.title}
            </h3>
          </div>
        </div>
      </article>
    </Link>
  );
}
