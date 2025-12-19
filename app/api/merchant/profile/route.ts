import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { getMerchant } from '@/lib/appwrite/database';

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

    return NextResponse.json({
      success: true,
      merchant: {
        id: merchant.$id,
        businessName: merchant.businessName,
        apiKey: merchant.apiKey,
        webhookUrl: merchant.webhookUrl,
        createdAt: merchant.createdAt
      }
    });

  } catch (error: any) {
    console.error('Error fetching merchant profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch merchant profile' },
      { status: 500 }
    );
  }
}
