'use client';

import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

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
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-12 sm:py-16 md:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-3 sm:mb-4">
            Müşterilerimiz Ne Diyor?
          </h2>
          <p className="text-base sm:text-lg text-neutral-800 px-2">
            Gerçek müşteri yorumları
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          <div 
            className="flex gap-4 sm:gap-6"
            style={{
              width: 'max-content',
              animation: 'scroll 60s linear infinite',
            }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                whileHover={{ 
                  scale: 1.05,
                  zIndex: 10,
                  transition: { duration: 0.15 }
                }}
                className={`bg-neutral-50 p-4 sm:p-6 rounded-xl w-[280px] sm:w-[320px] md:w-[350px] flex-shrink-0 transition-shadow duration-200 relative ${
                  hoveredIndex === index 
                      ? 'shadow-xl' 
                      : 'shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-primary-orange/30 mb-4" />
                <p className="text-neutral-800 mb-4 italic leading-relaxed">
                  &quot;{testimonial.text}&quot;
                </p>
                <div className="border-t pt-4">
                  <p className="font-bold text-dark-blue">{testimonial.name}</p>
                  <p className="text-sm text-neutral-600">{testimonial.location}</p>
                  <p className="text-xs text-neutral-500 mt-1">{testimonial.car}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <style jsx>{`
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(calc(-33.333%));
              }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}
