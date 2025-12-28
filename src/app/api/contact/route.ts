import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { captureException } from '@/lib/sentry';
import { protectAPI, createProtectedResponse } from '@/lib/security/api-protection';

export async function POST(request: NextRequest) {
  // API Protection (bot detection, rate limiting, size validation)
  const protection = await protectAPI(request, {
    maxRequestSize: 100 * 1024, // 100KB max for contact form
    rateLimit: {
      windowMs: 60000,
      maxRequests: 5,
    },
  });

  if (protection) {
    return protection; // Blocked by protection
  }

  try {
    const data = await request.json();
    logger.info('Contact form submission', { hasEmail: !!data.email });
    
    // Get base URL from request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Forward to create-lead endpoint to create customer in Supabase
    const createLeadResponse = await fetch(`${baseUrl}/api/create-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adSoyad: data.adSoyad,
        telefon: data.telefon,
        aracMarkaModel: data.aracMarkaModel,
        hasarTutari: data.hasarTutari,
        email: data.email, // Include email if provided
      }),
    });

    if (!createLeadResponse.ok) {
      const errorData = await createLeadResponse.json();
      throw new Error(errorData.error || 'Lead oluşturulamadı');
    }

    const result = await createLeadResponse.json();
    
    return createProtectedResponse(
      { success: true, ...result },
      200
    );
  } catch (error: any) {
    logger.error('Contact API error', { error: error.message, stack: error.stack });
    captureException(error instanceof Error ? error : new Error(error.message), {
      endpoint: '/api/contact',
    });
    
    return createProtectedResponse(
      { error: error.message || 'Bir hata oluştu' },
      500
    );
  }
}

