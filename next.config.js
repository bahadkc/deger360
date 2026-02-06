const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Image optimization - Mobile-first approach
  images: {
    formats: ['image/avif', 'image/webp'], // AVIF first for better mobile compression
    // Optimized device sizes for mobile: smaller sizes prioritized
    // Mobile devices typically don't need images larger than 828px width
    deviceSizes: [375, 414, 640, 750, 828, 1080, 1200, 1920],
    // Smaller image sizes for mobile thumbnails and icons
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Lower quality for mobile to reduce file size and improve load times
    // Next.js will use this as default, can be overridden per Image component
    // Mobile devices benefit more from faster load times than perfect quality
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Compression
  compress: true,
  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  // Enable better hydration error messages in production
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Output configuration
  output: 'standalone',
  // Set workspace root to silence lockfile warning
  outputFileTracingRoot: path.join(__dirname),
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', '@supabase/supabase-js'],
    // Extract critical CSS and inline it in HTML to reduce render-blocking
    // This automatically extracts and inlines critical CSS, deferring non-critical CSS
    optimizeCss: true,
  },
  // Note: Next.js 16 uses Turbopack by default which handles code splitting automatically
  // The webpack config has been removed as Turbopack provides better performance
  // Turbopack automatically optimizes chunk splitting and reduces unused JavaScript
  // Compiler configuration for modern JavaScript
  // Target modern browsers to avoid unnecessary polyfills
  compiler: {
    // Remove console.log in production (optional, but good practice)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Rewrites for admin panel security
  // Note: Proxy is automatically detected from src/proxy.ts in Next.js 16
  async rewrites() {
    return [
      {
        source: '/sys-admin-panel-secure-7x9k2m/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

module.exports = nextConfig;