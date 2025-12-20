import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Müşteri ID gerekli' },
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

    // Get user_auth record to find auth user ID
    const { data: userAuth, error: userAuthError } = await supabaseAdmin
      .from('user_auth')
      .select('id')
      .eq('customer_id', customerId)
      .single();

    // Delete customer (cascade will delete cases, documents, etc.)
    const { error: deleteError } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (deleteError) throw deleteError;

    // Delete auth user if exists
    if (userAuth && !userAuthError) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(userAuth.id);
      } catch (authError) {
        // Log but don't fail - customer is already deleted
        console.error('Error deleting auth user:', authError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Müşteri başarıyla silindi',
    });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
