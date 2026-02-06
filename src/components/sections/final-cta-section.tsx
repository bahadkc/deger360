'use client';

import { Calculator, ArrowRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

export function FinalCTASection() {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Use IntersectionObserver instead of framer-motion to reduce JS bundle size
    // This reduces main-thread work and script parsing time
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold: 0.1, rootMargin: '-100px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToForm = () => {
    document.getElementById('contact-form')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>} 
      className="py-20 bg-white"
      style={{ contain: 'layout style paint' }} // CSS containment for layout optimization
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className={`transition-all duration-600 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">
              Ücretsiz Değer Kaybınızı Hesaplayın
            </h2>
            <p className="text-xl mb-8 text-neutral-800">
              Sadece birkaç bilgi ile başlayın. Uzman ekibimiz sizinle iletişime geçsin.
            </p>
            <button
              onClick={scrollToForm}
              className="group bg-primary-orange hover:bg-primary-orange-hover text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <Calculator className="w-5 h-5" />
              Ücretsiz Değer Kaybı Hesapla
              <span className="inline-block animate-[slide_1.5s_ease-in-out_infinite]">
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
            <p className="mt-6 text-sm text-neutral-600">
              Ücretsiz • Hızlı • Güvenli
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes slide {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
      `}</style>
    </section>
  );
}
