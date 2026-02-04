const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 85],
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
    optimizePackageImports: ['lucide-react', 'recharts'],
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