/**
 * API route protection utilities
 * Use this in API routes for consistent protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { detectBot } from './bot-detection';
import { shouldBlockRequest, getClientIdentifier } from './advanced-rate-limit';
import { validateRequestSize, validateJSONPayload } from './request-limits';
import { logger } from '../logger';

export interface ProtectionOptions {
  requireAuth?: boolean;
  maxRequestSize?: number;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  allowBots?: boolean;
}

/**
 * Protect API route with multiple security layers
 */
export async function protectAPI(
  request: NextRequest,
  options: ProtectionOptions = {}
): Promise<NextResponse | null> {
  const {
    requireAuth = false,
    maxRequestSize,
    rateLimit,
    allowBots = false,
  } = options;

  const userAgent = request.headers.get('user-agent');
  const pathname = new URL(request.url).pathname;

  // 1. Bot Detection
  if (!allowBots) {
    const botDetection = detectBot(userAgent);
    
    if (botDetection.isSuspicious && !botDetection.isLegitimateBot) {
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
  }

  // 2. Rate Limiting
  const identifier = getClientIdentifier(request);
  const blockCheck = shouldBlockRequest(
    identifier,
    userAgent,
    pathname
  );
  
  if (blockCheck.blocked) {
    logger.warn('Request blocked by rate limit', {
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

  // 3. Request Size Validation
  const sizeValidation = validateRequestSize(request);
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

  // 4. Custom size limit
  if (maxRequestSize) {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > maxRequestSize) {
      return NextResponse.json(
        { error: `Request too large. Maximum size is ${maxRequestSize / 1024}KB` },
        { status: 413 }
      );
    }
  }

  // 5. JSON Payload Validation (for POST/PUT requests)
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const body = await request.clone().json();
        const validation = validateJSONPayload(body);
        
        if (!validation.valid) {
          logger.warn('JSON payload validation failed', {
            pathname,
            error: validation.error,
          });
          
          return NextResponse.json(
            { error: validation.error || 'Invalid payload' },
            { status: 400 }
          );
        }
      }
    } catch (error) {
      // If JSON parsing fails, continue (will be handled by route handler)
    }
  }

  // All checks passed
  return null;
}

/**
 * Get security headers for API responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

/**
 * Create protected API response
 */
export function createProtectedResponse(
  data: any,
  status: number = 200,
  additionalHeaders?: Record<string, string>
): NextResponse {
  const headers = {
    ...getSecurityHeaders(),
    ...additionalHeaders,
  };

  return NextResponse.json(data, { status, headers });
}

