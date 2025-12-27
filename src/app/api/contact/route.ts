import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
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
    
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

