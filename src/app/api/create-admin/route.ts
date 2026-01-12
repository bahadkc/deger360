import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Create server-side Supabase client to get current user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is superadmin using service role client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: userAuth, error: userAuthError } = await supabaseAdmin
      .from('user_auth')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userAuthError || !userAuth || userAuth.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden: Only superadmin can create admins' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password, and role are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (role !== 'admin' && role !== 'lawyer' && role !== 'acente') {
      return NextResponse.json({ error: 'Invalid role. Must be "admin", "lawyer", or "acente"' }, { status: 400 });
    }

    // Create user in Supabase Auth
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true, // Auto-confirm email
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      return NextResponse.json(
        { error: createUserError.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    if (!newUser.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Create user_auth record
    const { error: userAuthCreateError } = await supabaseAdmin
      .from('user_auth')
      .insert({
        id: newUser.user.id,
        customer_id: null, // Admin doesn't have a customer_id
        role: role,
        name: name.trim(),
        password: password, // Store password in plain text for display purposes
      });

    if (userAuthCreateError) {
      console.error('Error creating user_auth record:', userAuthCreateError);
      // Try to delete the auth user if user_auth creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.json(
        { error: 'Failed to create admin record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      user: {
        id: newUser.user.id,
        name: name.trim(),
        email: newUser.user.email,
        role: role,
      },
    });
  } catch (error: any) {
    console.error('Error in create-admin API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
