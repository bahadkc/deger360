/**
 * Resource Hints Component (Server Component)
 * Adds DNS prefetch and preconnect hints for external resources
 * to improve page load performance by reducing DNS lookup time.
 * These hints are added server-side so they're in the HTML head before render.
 */
export function ResourceHints() {
  return (
    <>
      {/* DNS prefetch for external resources */}
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      {/* Preconnect for critical resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Preload LCP image (logo) with high priority */}
      <link
        rel="preload"
        as="image"
        href="/images/logo.png"
        fetchPriority="high"
      />
      {/* Preconnect to own domain for faster font/CSS loading */}
      <link rel="preconnect" href="https://deger360.net" />
      {/* DNS prefetch for own domain subresources */}
      <link rel="dns-prefetch" href="https://deger360.net" />
    </>
  );
}
