'use client';

import { ContactForm } from '@/components/forms/contact-form';
import { useRef, useState, useEffect } from 'react';

export function ContactFormSection() {
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

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>} 
      id="contact-form" 
      className="py-20 bg-white"
      style={{ contain: 'layout style paint' }} // CSS containment for layout optimization
    >
      <div className="container mx-auto px-4">
        <div
          className={`transition-all duration-600 ease-out ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
