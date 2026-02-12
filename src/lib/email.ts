import { Resend } from 'resend';

export interface TeklifNotificationData {
  adSoyad: string;
  telefon: string;
  email?: string;
  aracMarkaModel: string;
  hasarTutari: number;
  dosyaTakipNo: string;
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';

/**
 * Sends a notification email when a customer fills the teklif form.
 * Requires RESEND_API_KEY and NOTIFICATION_EMAIL in env.
 */
export async function sendTeklifNotification(data: TeklifNotificationData): Promise<boolean> {
  const toEmail = process.env.NOTIFICATION_EMAIL;
  if (!toEmail) {
    console.warn('NOTIFICATION_EMAIL not set - skipping email notification');
    return false;
  }
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not set - skipping email notification');
    return false;
  }

  const hasarTutariFormatted = new Intl.NumberFormat('tr-TR').format(data.hasarTutari);

  try {
    const { error } = await resend.emails.send({
      from: `Değer360 Teklif <${FROM_EMAIL}>`,
      to: toEmail,
      subject: `Yeni Müşteri Form Doldurdu!`,
      html: `
        <h2>Yeni Müşteri Form Doldurdu!</h2>
        <p>Müşteri yeni form doldurdu. Admin panelden müşterinin bilgilerine bakarak müşteriyi arayın.</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Ad Soyad</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.adSoyad}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Telefon</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.telefon}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>E-posta</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.email || 'Belirtilmedi'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Araç Marka/Model</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.aracMarkaModel}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Hasar Tutarı</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${hasarTutariFormatted} TL</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dosya Takip No</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.dosyaTakipNo}</td>
          </tr>
        </table>
      `,
    });

    if (error) {
      console.error('Failed to send teklif notification email:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}
