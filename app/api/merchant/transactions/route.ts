import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { getMerchant, getTransactions } from '@/lib/appwrite/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const merchant = await getMerchant(user.$id);
    
    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const transactions = await getTransactions(merchant.$id, limit);

    // Filter by type and status if specified
    let filteredTransactions = transactions;
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    if (status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === status);
    }

    return NextResponse.json({
      success: true,
      transactions: filteredTransactions.map(t => ({
        id: t.$id,
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        fromAddress: t.fromAddress,
        toAddress: t.toAddress,
        txHash: t.txHash,
        description: t.description,
        createdAt: t.createdAt,
        completedAt: t.completedAt
      }))
    });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
