'use client';

import { useState, useEffect, useRef } from 'react';

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

export function ScrollAnimation({ children, className = '', delay = 0, id }: ScrollAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Ekrana girince görünür yap, bir daha gizleme (tek seferlik)
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            // observer.unobserve(entry.target); // İstersen bu satırı açıp takibi bırakabilirsin
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-100px',
      }
    );

    const { current } = domRef;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={domRef}
      id={id}
      // Tailwind sınıfları: Başlangıçta opaklık 0 ve aşağıda, görünür olunca normal yerine gelir.
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
}
