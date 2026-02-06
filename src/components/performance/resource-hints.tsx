/**
 * Resource Hints Component (Server Component)
 * Adds DNS prefetch and preconnect hints for external resources
 * to improve page load performance by reducing DNS lookup time.
 * These hints are added server-side so they're in the HTML head before render.
 * 
 * Optimized to prevent render-blocking requests and reduce critical request chains:
 * - Preconnect to own domain FIRST to establish connection early (reduces DNS/TLS time)
 * - Preload critical resources (LCP image)
 * - DNS prefetch for external domains (non-blocking)
 * - Preconnect only for critical third-party resources
 * 
 * Mobile-optimized: Prioritizes mobile performance with smaller resource hints
 * Strategy: By preconnecting to our own domain early, CSS and font requests can start
 * downloading immediately without waiting for DNS/TLS negotiation, breaking the request chain.
 */
export function ResourceHints() {
  // Get the base URL for preconnect (works in both dev and production)
  // In server components, window is undefined, so we use environment variable
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deger360.net';
  
  return (
    <>
      {/* Preconnect to own domain FIRST - critical for breaking request chains */}
      {/* This establishes TCP/TLS connection early, reducing latency for CSS/font requests */}
      {/* By connecting early, CSS can start downloading in parallel with HTML parsing */}
      {/* Mobile devices benefit more from early connection due to slower networks */}
      <link rel="preconnect" href={baseUrl} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={baseUrl} />
      
      {/* DNS prefetch for external resources - non-blocking, improves future requests */}
      {/* Deferred for mobile to prioritize critical resources */}
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      {/* Note: Google Fonts preconnect removed - using next/font/google which self-hosts fonts */}
      
      {/* Preload LCP image (logo) with high priority - critical for LCP metric */}
      {/* Mobile devices need this prioritized to improve LCP score */}
      <link
        rel="preload"
        as="image"
        href="/images/logo.png"
        fetchPriority="high"
        crossOrigin="anonymous"
      />
      
      {/* Note: Next.js automatically preloads CSS chunks and fonts when preload: true */}
      {/* The preconnect above ensures these requests can start immediately without DNS/TLS delay */}
      {/* Viewport meta tag is automatically added by Next.js, no need to duplicate */}
    </>
  );
}
