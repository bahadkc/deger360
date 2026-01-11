// Server Component - SEO dostu, içerik sunucuda render edilir
import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { HeroForm } from './hero-form';

export function HeroSection() {
  return (
    <section id="contact-form" className="relative min-h-screen bg-white pt-8 sm:pt-24 pb-8 sm:pb-12 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 w-full">
        <ScrollAnimation className="w-full">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-dark-blue mb-3 sm:mb-4 leading-tight px-2">
                Değer Kaybınızı{' '}
                <span className="text-primary-orange">Hesaplayın</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-neutral-800 max-w-2xl mx-auto px-2">
                Kaza sonrası aracınızın değer kaybını öğrenin ve tazminat hakkınızı kolayca hesaplayın. Ücretsiz, hızlı ve güvenli.
              </p>
            </div>

            {/* Hero Form */}
            <HeroForm />

            {/* Trust Message */}
            <p className="text-center text-sm text-neutral-600 mt-5">
              Ücretsiz • Hızlı • Güvenli
            </p>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
