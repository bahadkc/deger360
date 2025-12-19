import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

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
  matcher: ['/portal/:path*'],
};
