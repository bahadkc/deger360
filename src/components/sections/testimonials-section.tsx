// Server Component - SEO dostu, içerik sunucuda render edilir
import { ScrollAnimation } from '@/components/ui/scroll-animation';
import { TestimonialsCarousel } from './testimonials-carousel';

const testimonials = [
  {
    name: 'Murat Ç.',
    location: 'İstanbul',
    rating: 5,
    text: 'Araba kazasından sonra ne yapacağımı bilmiyordum. Bir arkadaşım önerdi, başvurdum. 4 ay sonra 42 bin lira geldi hesaba. Hiç uğraşmadım, her şeyi onlar halletti.',
    car: 'Renault Megane',
  },
  {
    name: 'Selin A.',
    location: 'Ankara',
    rating: 5,
    text: 'Ön ödeme istememeleri çok iyi oldu. Zaten kaza masrafı çıkmıştı, bir de avukat parası vermek istemiyordum. Sonunda 38 bin aldım, memnun kaldım.',
    car: 'Volkswagen Golf',
  },
  {
    name: 'Burak K.',
    location: 'İzmir',
    rating: 5,
    text: 'Sigorta şirketi reddetmişti, umudum yoktu. Değer360\'a başvurdum, mahkemeye gittiler. 6 ay sonra 50 bin lira tazminat aldım. Çok teşekkürler.',
    car: 'Toyota Corolla',
  },
  {
    name: 'Sude D.',
    location: 'Bursa',
    rating: 5,
    text: 'Bir tanıdığım önerdi, başvurdum. Portal üzerinden süreci takip ettim, çok rahattı. Ne zaman ne olacak hep bildirdiler. 45 bin lira aldım, hiç sorun çıkmadı.',
    car: 'Fiat Egea',
  },
  {
    name: 'Emre T.',
    location: 'Antalya',
    rating: 5,
    text: 'Başka bir yerle görüşmüştüm, ön ödeme istiyorlardı. Burada ön ödeme yok dediler, başvurdum. 3 ay içinde 40 bin lira geldi.',
    car: 'Hyundai i20',
  },
  {
    name: 'Deniz Y.',
    location: 'Adana',
    rating: 5,
    text: 'Evrakları toplamak çok zordu, benim işim gücüm var. Onlar her şeyi topladı, ben sadece imzaladım. 4 ay sonra 48 bin lira aldım.',
    car: 'Opel Astra',
  },
  {
    name: 'Cem Ö.',
    location: 'Gaziantep',
    rating: 5,
    text: 'Kaza geçirdim, araba tamir edildi ama değeri düştü. Bunu bilmiyordum, internetten araştırırken buldum. 43 bin lira aldım, çok iyi oldu.',
    car: 'Peugeot 301',
  },
  {
    name: 'Ayşe M.',
    location: 'Kocaeli',
    rating: 5,
    text: 'WhatsApp\'tan sürekli bilgi verdiler, hiç aramadım bile. 5 ay sonra 52 bin lira geldi hesaba. Çok memnunum, herkese öneriyorum.',
    car: 'Skoda Octavia',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white overflow-hidden">
      <ScrollAnimation>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-3 sm:mb-4">
              Müşterilerimiz Ne Diyor?
            </h2>
            <p className="text-base sm:text-lg text-neutral-800 px-2">
              Gerçek müşteri yorumları
            </p>
          </div>

          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </ScrollAnimation>
    </section>
  );
}
