import { NextRequest, NextResponse } from 'next/server'
import { createAccount } from '@/lib/appwrite/auth'
import { createMerchant } from '@/lib/appwrite/database'

export async function POST(request: NextRequest) {
  try {
    const { businessName, email, password } = await request.json()

    if (!businessName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Create user account
    const user = await createAccount(email, password, businessName)
    
    // Create merchant profile
    const merchant = await createMerchant({
      userId: user.$id,
      businessName,
      apiKey: generateApiKey(),
      createdAt: new Date().toISOString()
    })
    
    // Create initial prepaid wallet
    // This would typically be done by an Appwrite function, but for now we'll skip it
    // The wallet will be created on first access
    
    return NextResponse.json(
      { 
        message: 'Account created successfully', 
        user: {
          id: user.$id,
          email: user.email,
          name: user.name
        },
        merchant: {
          id: merchant.$id,
          businessName: merchant.businessName,
          apiKey: merchant.apiKey
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    )
  }
}

function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'gp_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}