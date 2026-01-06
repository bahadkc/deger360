/**
 * Cookie utility functions
 * Determines if cookies should be secure based on the actual connection protocol
 */

/**
 * Determines if cookies should use the Secure flag
 * Cookies should only be Secure when using HTTPS
 */
export function shouldUseSecureCookie(request?: { url?: string; headers?: Headers }): boolean {
  // If we have a request object, check the protocol
  if (request?.url) {
    try {
      const url = new URL(request.url);
      return url.protocol === 'https:';
    } catch {
      // If URL parsing fails, fall back to environment check
    }
  }
  
  // Check headers for forwarded protocol (common in proxies)
  if (request?.headers) {
    const forwardedProto = request.headers.get('x-forwarded-proto');
    if (forwardedProto === 'https') {
      return true;
    }
  }
  
  // Fall back to environment check (but only for actual production HTTPS)
  // In development, never use secure cookies unless explicitly HTTPS
  return process.env.NODE_ENV === 'production' && 
         (process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_FORCE_SECURE_COOKIES === 'true');
}

/**
 * Get cookie options with proper Secure flag
 */
export function getCookieOptions(request?: { url?: string; headers?: Headers }, options?: any) {
  const isSecure = shouldUseSecureCookie(request);
  
  return {
    ...options,
    // Only set Secure flag if actually using HTTPS
    secure: isSecure,
    // SameSite for cross-site requests
    sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') || 'lax',
    // Path should be root for all cookies
    path: options?.path || '/',
    // HttpOnly for security (Supabase auth cookies should be httpOnly)
    httpOnly: options?.httpOnly !== false,
    // Max age from options or default
    maxAge: options?.maxAge || 60 * 60 * 24 * 7, // 7 days default
  };
}

