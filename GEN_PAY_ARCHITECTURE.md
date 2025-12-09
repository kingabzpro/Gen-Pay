# Gen Pay Platform - Supabase-Powered Architecture

## 📋 Project Overview

A modern, scalable stable coin payment platform built with Supabase, Next.js, and Vercel. This implementation focuses on simplicity and rapid development while maintaining enterprise-grade security and performance.

### Core Features (Phase 1 MVP)
- Supabase-powered authentication system
- Tron (TRC20) USDT wallet integration
- P2P transfers with instant settlement
- Transaction history and monitoring
- Basic KYC verification
- Real-time updates using Supabase Realtime

---

## 🏗️ Technology Stack

### Backend & Database
- **Database**: Supabase (PostgreSQL 16)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for KYC documents)
- **Edge Functions**: Supabase Edge Functions (blockchain operations)
- **Realtime**: Supabase Realtime (transaction updates)

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod

### Blockchain Integration
- **Network**: Tron (TRC20)
- **Token**: USDT (TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t)
- **Web3 Library**: ethers.js (TronWeb for Tron-specific operations)
- **RPC Provider**: TronGrid API

### Deployment & Infrastructure
- **Frontend Hosting**: Vercel
- **Backend**: Supabase (managed)
- **CDN**: Vercel Edge Network
- **Environment Management**: Vercel Environment Variables

---

## 📁 Project Structure

```
gen-pay/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── wallet/
│   │   │   ├── transactions/
│   │   │   └── kyc/
│   │   ├── api/                      # API routes (if needed)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── auth/                     # Authentication components
│   │   ├── wallet/                   # Wallet components
│   │   ├── transactions/              # Transaction components
│   │   └── kyc/                      # KYC components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase client
│   │   │   ├── auth.ts               # Auth helpers
│   │   │   └── realtime.ts           # Realtime subscriptions
│   │   ├── blockchain/
│   │   │   ├── tron.ts               # Tron integration
│   │   │   └── wallet.ts             # Wallet operations
│   │   ├── utils.ts                  # Utility functions
│   │   └── validations.ts            # Zod schemas
│   ├── hooks/
│   │   ├── useAuth.ts                # Auth hook
│   │   ├── useWallet.ts              # Wallet hook
│   │   └── useTransactions.ts        # Transactions hook
│   ├── store/
│   │   └── index.ts                  # Zustand store
│   └── types/
│       ├── auth.ts                   # Auth types
│       ├── wallet.ts                 # Wallet types
│       └── transaction.ts            # Transaction types
├── supabase/
│   ├── migrations/                   # Database migrations
│   ├── functions/                    # Edge Functions
│   │   ├── tron-operations/
│   │   └── webhook-handlers/
│   └── seed.sql                      # Initial data
├── public/
│   └── assets/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🗄️ Database Schema (Supabase)

### Core Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  kyc_status TEXT DEFAULT 'UNVERIFIED' CHECK (kyc_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallets table
CREATE TABLE public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  network TEXT DEFAULT 'TRON' NOT NULL,
  address TEXT UNIQUE NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  balance DECIMAL(20,6) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_wallet_id UUID REFERENCES public.wallets(id),
  to_wallet_id UUID REFERENCES public.wallets(id),
  type TEXT NOT NULL CHECK (type IN ('SEND', 'RECEIVE', 'DEPOSIT', 'WITHDRAW')),
  amount DECIMAL(20,6) NOT NULL,
  network TEXT DEFAULT 'TRON' NOT NULL,
  tx_hash TEXT UNIQUE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED')),
  fee DECIMAL(20,6) DEFAULT 0,
  metadata JSONB,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KYC Documents table
CREATE TABLE public.kyc_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('PASSPORT', 'ID_CARD', 'DRIVING_LICENSE', 'PROOF_OF_ADDRESS')),
  document_number TEXT,
  document_url TEXT NOT NULL, -- Supabase Storage URL
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Wallets RLS
CREATE POLICY "Users can view own wallets" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions RLS
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- KYC Documents RLS
CREATE POLICY "Users can manage own KYC documents" ON public.kyc_documents
  FOR ALL USING (auth.uid() = user_id);

-- Notifications RLS
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## 🔌 Supabase Integration

### Client Configuration

```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const supabase = createClientComponentClient<Database>()

// lib/supabase/auth.ts
export const signUp = async (email: string, password: string, metadata: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}
```

### Realtime Subscriptions

```typescript
// lib/supabase/realtime.ts
export const subscribeToTransactions = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('transactions')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToWalletBalance = (walletId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('wallet_balance')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'wallets',
        filter: `id=eq.${walletId}`
      },
      callback
    )
    .subscribe()
}
```

---

## 🔗 Blockchain Integration

### Tron Integration

```typescript
// lib/blockchain/tron.ts
import TronWeb from 'tronweb'

const TRON_GRID_API = 'https://api.trongrid.io'
const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

export class TronService {
  private tronWeb: TronWeb

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: TRON_GRID_API,
      headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY },
      privateKey: process.env.TRON_PRIVATE_KEY
    })
  }

  async createWallet() {
    const account = await this.tronWeb.createAccount()
    return {
      address: account.address,
      privateKey: account.privateKey,
      publicKey: account.publicKey
    }
  }

  async getBalance(address: string) {
    const contract = await this.tronWeb.contract().at(USDT_CONTRACT)
    const balance = await contract.balanceOf(address).call()
    return this.tronWeb.fromSun(balance)
  }

  async sendUSDT(fromAddress: string, toAddress: string, amount: number, privateKey: string) {
    const tronWeb = new TronWeb({
      fullHost: TRON_GRID_API,
      privateKey
    })

    const contract = await tronWeb.contract().at(USDT_CONTRACT)
    const transaction = await contract.transfer(toAddress, amount).send({
      feeLimit: 100000000,
      callValue: 0,
      tokenId: 0,
      tokenValue: 0
    })

    return transaction
  }

  async getTransactionStatus(txHash: string) {
    const transaction = await this.tronWeb.trx.getTransaction(txHash)
    return transaction
  }
}
```

---

## 🎨 UI Components

### Authentication Components

```tsx
// components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { signIn } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await signIn(email, password)
    
    if (!error) {
      router.push('/dashboard')
    } else {
      console.error('Login error:', error.message)
    }
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
  )
}
```

### Wallet Components

```tsx
// components/wallet/WalletCard.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { TronService } from '@/lib/blockchain/tron'

interface Wallet {
  id: string
  address: string
  balance: number
  network: string
}

export function WalletCard() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [balance, setBalance] = useState('0')
  const tronService = new TronService()

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setWallet(data)
      const trxBalance = await tronService.getBalance(data.address)
      setBalance(trxBalance)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">TRON Wallet</h3>
      {wallet ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Address: {wallet.address}</p>
          <p className="text-2xl font-bold">{balance} USDT</p>
        </div>
      ) : (
        <p>No wallet found</p>
      )}
    </div>
  )
}
```

---

## 🚀 Deployment Configuration

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "TRON_API_KEY": "@tron-api-key"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TRON_API_KEY=your_tron_grid_api_key
TRON_PRIVATE_KEY=your_tron_private_key
```

---

## 📈 Monitoring & Analytics

### Supabase Analytics

```typescript
// lib/analytics.ts
export const trackTransaction = async (transaction: any) => {
  await supabase
    .from('analytics_events')
    .insert({
      event_type: 'transaction_completed',
      user_id: transaction.user_id,
      data: {
        amount: transaction.amount,
        type: transaction.type,
        network: transaction.network
      }
    })
}

export const trackUserAction = async (action: string, userId: string, data?: any) => {
  await supabase
    .from('analytics_events')
    .insert({
      event_type: action,
      user_id: userId,
      data
    })
}
```

---

## 🔐 Security Implementation

### Row Level Security (RLS)

All database tables are protected with RLS policies ensuring users can only access their own data. Supabase handles authentication and authorization seamlessly.

### Data Encryption

- Private keys are encrypted before storage
- Sensitive data is encrypted at rest and in transit
- Supabase manages SSL/TLS certificates automatically

### Input Validation

```typescript
// lib/validations.ts
import { z } from 'zod'

export const transactionSchema = z.object({
  toAddress: z.string().min(1, 'Recipient address is required'),
  amount: z.number().min(0.01, 'Minimum amount is 0.01 USDT'),
  network: z.enum(['TRON'])
})

export const kycSchema = z.object({
  documentType: z.enum(['PASSPORT', 'ID_CARD', 'DRIVING_LICENSE']),
  documentNumber: z.string().min(1, 'Document number is required'),
  documentFile: z.instanceof(File)
})
```

---

## 📝 Implementation Timeline

### Week 1-2: Foundation
- Set up Supabase project
- Configure authentication
- Design database schema
- Set up Next.js project

### Week 3-4: Core Features
- Implement wallet management
- Tron blockchain integration
- P2P transfer functionality
- Transaction history

### Week 5-6: UI/UX
- Build responsive components
- Implement dashboard
- Add real-time updates
- KYC verification system

### Week 7-8: Testing & Deployment
- End-to-end testing
- Security audit
- Vercel deployment
- Performance optimization

---

## 🎯 Next Steps

After completing Phase 1 MVP, the platform can be extended with:

1. **Multi-chain support** (Ethereum, Polygon, BSC)
2. **Merchant payment gateway**
3. **Subscription payments**
4. **Advanced analytics**
5. **Mobile app development**

This architecture provides a solid foundation for a scalable, secure, and user-friendly stable coin payment platform.