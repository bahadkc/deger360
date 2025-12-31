import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { detectBot } from '@/lib/security/bot-detection';
import { shouldBlockRequest, getClientIdentifier } from '@/lib/security/advanced-rate-limit';
import { validateRequestSize } from '@/lib/security/request-limits';
import { logger } from '@/lib/logger';
import { ADMIN_PATH, isAdminPath } from '@/lib/config/admin-paths';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  
  // Block direct /admin access - redirect to 404 page
  // Admin panel is only accessible via hidden path: /sys-admin-panel-secure-7x9k2m/*
  // Check if request is coming from hidden path (via referer or direct check)
  if (pathname.startsWith('/admin')) {
    // Rewrite to not-found page to show custom 404
    return NextResponse.rewrite(new URL('/not-found', req.url));
  }
  
  // Note: Admin path is hidden via Next.js rewrite
  // /sys-admin-panel-secure-7x9k2m/* → /admin/* (internal)
  // Direct /admin access redirects to custom 404 page
  // This provides security through obscurity

  // Skip bot detection for static assets and API health checks
  const skipBotCheck = 
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/sitemap') ||
    pathname.startsWith('/api/robots') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/);

  if (!skipBotCheck) {
    // Bot detection
    const userAgent = req.headers.get('user-agent');
    const botDetection = detectBot(userAgent);
    
    // Block suspicious bots on API routes
    if (pathname.startsWith('/api') && botDetection.isSuspicious && !botDetection.isLegitimateBot) {
      logger.warn('Suspicious bot blocked', {
        userAgent,
        pathname,
        reason: botDetection.reason,
      });
      
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Rate limiting for API routes
    if (pathname.startsWith('/api')) {
      const identifier = getClientIdentifier(req);
      const blockCheck = shouldBlockRequest(identifier, userAgent, pathname);
      
      if (blockCheck.blocked) {
        logger.warn('Request blocked', {
          identifier,
          pathname,
          reason: blockCheck.reason,
        });
        
        return NextResponse.json(
          { error: blockCheck.reason || 'Too many requests' },
          { 
            status: 429,
            headers: {
              'Retry-After': '60',
            },
          }
        );
      }

      // Validate request size
      const sizeValidation = validateRequestSize(req);
      if (!sizeValidation.valid) {
        logger.warn('Request size validation failed', {
          pathname,
          error: sizeValidation.error,
        });
        
        return NextResponse.json(
          { error: sizeValidation.error },
          { status: 413 }
        );
      }
    }
  }

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Security headers
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // HSTS header (only for HTTPS)
  if (req.nextUrl.protocol === 'https:') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com;
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', cspHeader);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  // Portal sayfaları için auth kontrolü
  if (req.nextUrl.pathname.startsWith('/portal')) {
    // Giriş sayfası hariç
    if (req.nextUrl.pathname === '/portal/giris') {
      return response;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Eğer kullanıcı yoksa login'e yönlendir
    if (!user) {
      return NextResponse.redirect(new URL('/portal/giris', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/portal/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
