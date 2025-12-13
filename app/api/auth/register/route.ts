import { NextRequest, NextResponse } from 'next/server'
import { createAccount } from '@/lib/appwrite/auth'

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

    const user = await createAccount(email, password, businessName)
    
    return NextResponse.json(
      { message: 'Account created successfully', user },
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