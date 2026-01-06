import { NextResponse } from 'next/server';
import { ADMIN_PATH } from '@/lib/config/admin-paths';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  
  const robots = `User-agent: *
Allow: /
Disallow: ${ADMIN_PATH}/
Disallow: /admin/
Allow: /portal/
Disallow: /api/
Disallow: /debug/
Disallow: /test/

Sitemap: ${baseUrl}/sitemap.xml`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

