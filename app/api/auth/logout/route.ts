import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/supabase/auth';

export async function POST(request: NextRequest) {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
