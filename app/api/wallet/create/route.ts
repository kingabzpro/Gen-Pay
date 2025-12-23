import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { createWalletForUser, getWalletByUserId } from '@/lib/services/wallet';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if wallet already exists
    const existingWallet = await getWalletByUserId(user.id);
    if (existingWallet) {
      return NextResponse.json({
        success: true,
        wallet: existingWallet,
        message: 'Wallet already exists'
      });
    }

    const wallet = await createWalletForUser(user.id);

    return NextResponse.json({
      success: true,
      wallet
    });
  } catch (error: any) {
    console.error('Wallet creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
