import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/supabase/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { user, session } = await signIn(email, password);

    return NextResponse.json({
      success: true,
      user,
      session
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}
