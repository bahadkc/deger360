'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

interface OptimizedLogoProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  quality?: number;
}

/**
 * Optimized Logo Component
 * 
 * Uses Next.js Image optimization (AVIF/WebP conversion, responsive sizes)
 * while ensuring fetchPriority="high" is applied for LCP optimization.
 * 
 * Features:
 * - Automatic format conversion (AVIF/WebP) via Next.js Image Optimization API
 * - Responsive image sizes for different viewports
 * - High priority loading for LCP optimization
 * - Proper decoding and loading attributes
 * 
 * Next.js Image Optimization Benefits (similar to Image CDN):
 * - Automatic format conversion: AVIF for modern browsers, WebP for others, fallback to original
 *   → 40-80% file size reduction compared to original PNG/JPEG
 * - Responsive srcset generation based on device sizes (16w, 32w, 64w, 128w, 256w, etc.)
 *   → Serves appropriate size for each viewport, reducing bandwidth
 * - Optimized compression based on quality setting (75 = good balance between quality and size)
 * - Prevents layout shift with proper width/height attributes
 * - Automatic format selection based on browser capabilities (Accept header)
 */
export function OptimizedLogo({
  src = '/images/logo.png',
  alt = 'Değer360 - Araç Değer Kaybı Tazminatı Danışmanlığı Logo',
  width = 150,
  height = 50,
  className = 'h-8 sm:h-10 md:h-12 w-auto',
  sizes = '(max-width: 640px) 120px, (max-width: 768px) 150px, 200px',
  quality = 70, // Reduced quality for mobile to improve load times
}: OptimizedLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure fetchPriority="high" is set on the rendered img element
    // Next.js Image component with priority={true} should add this, but we ensure it's there
    // Using requestAnimationFrame to ensure the img element is rendered
    const setFetchPriority = () => {
      if (containerRef.current) {
        const imgElement = containerRef.current.querySelector('img') as HTMLImageElement;
        if (imgElement && !imgElement.getAttribute('fetchpriority')) {
          imgElement.setAttribute('fetchpriority', 'high');
          imgElement.setAttribute('decoding', 'sync');
          imgElement.setAttribute('loading', 'eager');
        }
      }
    };

    // Try immediately and after a short delay to catch the img element
    setFetchPriority();
    requestAnimationFrame(setFetchPriority);
    const timeoutId = setTimeout(setFetchPriority, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div ref={containerRef} className="inline-block">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        quality={quality}
        priority={true}
        // Next.js Image Optimization automatically:
        // - Converts to AVIF/WebP format based on browser support (via Accept header)
        // - Generates responsive srcset with multiple sizes (16w, 32w, 64w, etc.)
        // - Optimizes compression based on quality setting (75 = good balance)
        // - Adds proper width/height to prevent Cumulative Layout Shift (CLS)
        // - Uses modern image formats for 40-80% file size reduction
      />
    </div>
  );
}
