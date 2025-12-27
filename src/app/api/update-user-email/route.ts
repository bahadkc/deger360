import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, newEmail } = body;

    if (!userId || !newEmail) {
      return NextResponse.json(
        { success: false, error: 'User ID ve yeni email gerekli' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz email formatı' },
        { status: 400 }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Update email using admin API
    console.log('Updating email for user:', userId, 'to:', newEmail);
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: newEmail.trim(),
    });

    if (updateError) {
      console.error('Email update error:', updateError);
      throw updateError;
    }

    console.log('Email updated successfully for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Email başarıyla güncellendi',
      userId: userId,
    });
  } catch (error: any) {
    console.error('Error updating email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
