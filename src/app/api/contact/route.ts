import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Burada email gönderimi, CRM entegrasyonu vb. yapabilirsiniz
    console.log('Form submission:', data);
    
    // Örnek: Email gönderimi (Resend, SendGrid, vb. kullanabilirsiniz)
    // await sendEmail({
    //   to: 'info@sirketiniz.com',
    //   subject: 'Yeni Değer Kaybı Başvurusu',
    //   html: `
    //     <h2>Yeni Başvuru</h2>
    //     <p><strong>Ad Soyad:</strong> ${data.adSoyad}</p>
    //     <p><strong>Telefon:</strong> ${data.telefon}</p>
    //     <p><strong>Araç:</strong> ${data.aracMarkaModel}</p>
    //     <p><strong>Hasar Tutarı:</strong> ${data.hasarTutari} TL</p>
    //   `
    // });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

