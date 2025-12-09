# Gen Pay Platform - Implementation Guide

## 🚀 Quick Start

This guide provides step-by-step instructions to build the Gen Pay platform using Next.js 16, Supabase, and Vercel - all on free tiers.

---

## 📋 Prerequisites

### Required Accounts
- [GitHub Account](https://github.com) (Free)
- [Supabase Account](https://supabase.com) (Free)
- [Vercel Account](https://vercel.com) (Free)
- [TronGrid API Key](https://www.trongrid.io) (Free)

### Required Tools
- Node.js 18+ 
- npm or yarn
- Git
- VS Code (recommended)

---

## 🗂️ Project Setup

### 1. Initialize Next.js Project

```bash
# Create new Next.js 16 project
npx create-next-app@latest gen-pay --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Navigate to project
cd gen-pay

# Install additional dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react @supabase/auth-ui-react @supabase/auth-ui-shared
npm install zustand react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install tronweb axios
npm install @types/node

# Install dev dependencies
npm install -D @types/react @types/react-dom
```

### 2. Configure Tailwind CSS

```bash
# Install shadcn/ui
npx shadcn-ui@latest init

# Install required components
npx shadcn-ui@latest add button card input label form dialog dropdown-menu toast
```

### 3. Set Up Environment Variables

Create `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Tron Configuration
TRON_GRID_API_KEY=your_trongrid_api_key
TRON_NETWORK=shasta  # Use 'mainnet' for production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗄️ Supabase Setup

### 1. Create Database Schema

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
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
  document_url TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
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

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own wallets" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own KYC documents" ON public.kyc_documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Set Up Supabase Storage

Create storage bucket for KYC documents:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false);

-- Set up storage policies
CREATE POLICY "Users can upload own KYC documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kyc-documents' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view own KYC documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kyc-documents' AND 
    auth.role() = 'authenticated'
  );
```

---

## 🔧 Project Structure Setup

### 1. Create Directory Structure

```bash
mkdir -p src/components/{auth,wallet,transactions,kyc,ui}
mkdir -p src/lib/{supabase,blockchain,utils}
mkdir -p src/hooks
mkdir -p src/store
mkdir -p src/types
```

### 2. Set Up TypeScript Types

Create `src/types/database.ts`:

```typescript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          kyc_status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          network: string
          address: string
          encrypted_private_key: string
          balance: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['wallets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['wallets']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          from_wallet_id: string | null
          to_wallet_id: string | null
          type: 'SEND' | 'RECEIVE' | 'DEPOSIT' | 'WITHDRAW'
          amount: number
          network: string
          tx_hash: string | null
          status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED'
          fee: number
          metadata: Json | null
          confirmed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      kyc_documents: {
        Row: {
          id: string
          user_id: string
          document_type: 'PASSPORT' | 'ID_CARD' | 'DRIVING_LICENSE' | 'PROOF_OF_ADDRESS'
          document_number: string | null
          document_url: string
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          reviewed_at: string | null
          reviewed_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['kyc_documents']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['kyc_documents']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
  }
}
```

### 3. Configure Supabase Client

Create `src/lib/supabase/client.ts`:

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const supabase = createClientComponentClient<Database>()
```

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({
    cookies
  })
}
```

---

## 🔐 Authentication Implementation

### 1. Auth Components

Create `src/components/auth/AuthForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthFormProps {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        })

        if (error) throw error
        
        // Create profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              first_name: firstName,
              last_name: lastName,
            })

          if (profileError) throw profileError
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      }

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Sign In' : 'Create Account'}</CardTitle>
        <CardDescription>
          {mode === 'login' 
            ? 'Enter your credentials to access your account'
            : 'Create a new account to get started'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### 2. Auth Pages

Create `src/app/(auth)/login/page.tsx`:

```typescript
import Link from 'next/link'
import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <AuthForm mode="login" />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

Create `src/app/(auth)/register/page.tsx`:

```typescript
import Link from 'next/link'
import { AuthForm } from '@/components/auth/AuthForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <AuthForm mode="register" />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## 💳 Wallet Implementation

### 1. Tron Service

Create `src/lib/blockchain/tron.ts`:

```typescript
import TronWeb from 'tronweb'

const TRON_GRID_API = process.env.TRON_GRID_API || 'https://api.trongrid.io'
const USDT_CONTRACT = process.env.TRON_NETWORK === 'mainnet' 
  ? 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
  : 'TXYZopYOMghyEsLfmwJQoJ2LwGy6JDTV9C' // Shasta testnet

export class TronService {
  private tronWeb: TronWeb

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: TRON_GRID_API,
      headers: { 
        "TRON-PRO-API-KEY": process.env.TRON_GRID_API_KEY 
      }
    })
  }

  async createWallet() {
    const account = this.tronWeb.utils.accounts.generateAccount()
    return {
      address: account.address,
      privateKey: account.privateKey,
      publicKey: account.publicKey
    }
  }

  async getBalance(address: string): Promise<number> {
    try {
      const contract = await this.tronWeb.contract().at(USDT_CONTRACT)
      const balance = await contract.balanceOf(address).call()
      return this.tronWeb.utils.fromSun(balance) / 1000000 // USDT has 6 decimals
    } catch (error) {
      console.error('Error getting balance:', error)
      return 0
    }
  }

  async sendUSDT(fromAddress: string, toAddress: string, amount: number, privateKey: string) {
    try {
      const tronWeb = new TronWeb({
        fullHost: TRON_GRID_API,
        privateKey
      })

      const contract = await tronWeb.contract().at(USDT_CONTRACT)
      const amountInSun = amount * 1000000 // Convert to USDT smallest unit

      const transaction = await contract.transfer(toAddress, amountInSun).send({
        feeLimit: 100000000,
        callValue: 0,
      })

      return transaction
    } catch (error) {
      console.error('Error sending USDT:', error)
      throw error
    }
  }

  async getTransactionStatus(txHash: string) {
    try {
      const transaction = await this.tronWeb.trx.getTransaction(txHash)
      return transaction
    } catch (error) {
      console.error('Error getting transaction:', error)
      return null
    }
  }

  validateAddress(address: string): boolean {
    return this.tronWeb.isAddress(address)
  }
}
```

### 2. Wallet Components

Create `src/components/wallet/WalletCard.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { TronService } from '@/lib/blockchain/tron'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Plus } from 'lucide-react'

interface Wallet {
  id: string
  address: string
  balance: number
  network: string
}

export function WalletCard() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [balance, setBalance] = useState('0')
  const [loading, setLoading] = useState(true)
  const tronService = new TronService()

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (data) {
        setWallet(data)
        const trxBalance = await tronService.getBalance(data.address)
        setBalance(trxBalance.toFixed(6))
      }
    } catch (error) {
      console.error('Error fetching wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const createWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newWallet = await tronService.createWallet()
      
      // In production, encrypt the private key before storing
      const { data, error } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          network: 'TRON',
          address: newWallet.address,
          encrypted_private_key: newWallet.privateKey, // Encrypt this in production
          balance: 0,
        })
        .select()
        .single()

      if (error) throw error

      setWallet(data)
      setBalance('0.000000')
    } catch (error) {
      console.error('Error creating wallet:', error)
    }
  }

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
    }
  }

  if (loading) {
    return <div>Loading wallet...</div>
  }

  if (!wallet) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create Wallet</CardTitle>
          <CardDescription>
            Create your TRON wallet to start sending and receiving USDT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={createWallet} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>TRON Wallet</CardTitle>
        <CardDescription>Your USDT wallet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Address</p>
          <div className="flex items-center space-x-2">
            <p className="text-xs font-mono truncate">{wallet.address}</p>
            <Button size="sm" variant="outline" onClick={copyAddress}>
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Balance</p>
          <p className="text-2xl font-bold">{balance} USDT</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 📊 Dashboard Implementation

### 1. Dashboard Layout

Create `src/app/(dashboard)/layout.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
```

### 2. Dashboard Navigation

Create `src/components/dashboard/DashboardNav.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Wallet, History, FileText, LogOut } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Wallet },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/transactions', label: 'Transactions', icon: History },
  { href: '/dashboard/kyc', label: 'KYC', icon: FileText },
]

export default function DashboardNav() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold">
              Gen Pay
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}
```

### 3. Dashboard Page

Create `src/app/(dashboard)/page.tsx`:

```typescript
import { WalletCard } from '@/components/wallet/WalletCard'
import { TransactionList } from '@/components/transactions/TransactionList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Manage your crypto wallet and transactions</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WalletCard />
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your account overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Transactions</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span>KYC Status</span>
                <span className="font-semibold text-yellow-600">Pending</span>
              </div>
              <div className="flex justify-between">
                <span>Account Status</span>
                <span className="font-semibold text-green-600">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <TransactionList limit={5} />
      </div>
    </div>
  )
}
```

---

## 🔄 Transaction Implementation

### 1. Transaction Components

Create `src/components/transactions/TransactionList.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Transaction {
  id: string
  type: 'SEND' | 'RECEIVE' | 'DEPOSIT' | 'WITHDRAW'
  amount: number
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED'
  tx_hash: string | null
  created_at: string
}

interface TransactionListProps {
  limit?: number
}

export function TransactionList({ limit = 10 }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [limit])

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SEND': return 'bg-red-100 text-red-800'
      case 'RECEIVE': return 'bg-green-100 text-green-800'
      case 'DEPOSIT': return 'bg-blue-100 text-blue-800'
      case 'WITHDRAW': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div>Loading transactions...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions found</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Badge className={getTypeColor(transaction.type)}>
                    {transaction.type}
                  </Badge>
                  <div>
                    <p className="font-medium">{transaction.amount} USDT</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                  {transaction.tx_hash && (
                    <p className="text-xs text-gray-500 mt-1">
                      {transaction.tx_hash.slice(0, 10)}...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## 🚀 Deployment

### 1. Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "TRON_GRID_API_KEY": "@tron-grid-api-key",
    "TRON_NETWORK": "@tron-network"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Or use Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add TRON_GRID_API_KEY
vercel env add TRON_NETWORK
```

---

## 📝 Next Steps

After completing this implementation:

1. **Test all functionality** on Shasta testnet
2. **Implement proper encryption** for private keys
3. **Add comprehensive error handling**
4. **Set up monitoring and analytics**
5. **Implement rate limiting**
6. **Add email notifications**
7. **Create comprehensive tests**
8. **Set up CI/CD pipeline**

This implementation provides a solid foundation for your Gen Pay platform using entirely free services, with clear paths for scaling when needed.