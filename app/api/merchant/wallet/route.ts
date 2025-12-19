import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { getMerchant, getWallet, createTransaction } from '@/lib/appwrite/database';

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

    const wallet = await getWallet(merchant.$id);

    return NextResponse.json({
      success: true,
      wallet: wallet ? {
        id: wallet.$id,
        balance: wallet.balance,
        ledger: wallet.ledger || []
      } : {
        balance: 0,
        ledger: []
      }
    });

  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { type, amount, toAddress, fromAddress, description } = await request.json();

    if (!type || !amount || !toAddress) {
      return NextResponse.json(
        { error: 'Type, amount, and toAddress are required' },
        { status: 400 }
      );
    }

    const merchant = await getMerchant(user.$id);
    
    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant profile not found' },
        { status: 404 }
      );
    }

    const wallet = await getWallet(merchant.$id);

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Check balance for send transactions
    if (type === 'send' && wallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create transaction record
    const transaction = await createTransaction({
      merchantId: merchant.$id,
      type,
      amount: parseFloat(amount),
      currency: 'USDT',
      status: 'pending',
      fromAddress,
      toAddress,
      description,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.$id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        fromAddress: transaction.fromAddress,
        toAddress: transaction.toAddress,
        description: transaction.description,
        createdAt: transaction.createdAt
      }
    });

  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
