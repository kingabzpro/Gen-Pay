import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { getWalletByUserId } from '@/lib/services/wallet';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const wallet = await getWalletByUserId(user.id);
    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: 'Wallet not found. Please create a wallet first.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      address: wallet.address,
      network: 'TRON Testnet (Nile)',
      currency: 'USDT',
      instructions: 'Send only TRON (TRX) and USDT on TRON network to this address. Sending other assets may result in loss of funds.'
    });
  } catch (error: any) {
    console.error('Receive address error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
