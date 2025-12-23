import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { getWalletByUserId, syncWalletBalance } from '@/lib/services/wallet';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let wallet = await getWalletByUserId(user.id);
    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: 'Wallet not found'
      }, { status: 404 });
    }

    // Sync balance from blockchain
    await syncWalletBalance(wallet.id);

    // Fetch updated wallet
    wallet = await getWalletByUserId(user.id);

    return NextResponse.json({
      success: true,
      wallet
    });
  } catch (error: any) {
    console.error('Balance fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
