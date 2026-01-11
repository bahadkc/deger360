'use client';

import { useState } from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  car: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div className="relative overflow-hidden">
      <div 
        className="flex gap-4 sm:gap-6"
        style={{
          width: 'max-content',
          animation: 'scroll 60s linear infinite',
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`bg-neutral-50 p-4 sm:p-6 rounded-xl w-[280px] sm:w-[320px] md:w-[350px] flex-shrink-0 transition-all duration-200 relative ${
              hoveredIndex === index 
                  ? 'shadow-xl scale-105 z-10' 
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
          </div>
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
  );
}
