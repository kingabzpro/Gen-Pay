# Gen-Pay Local Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- TronGrid API key

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Configure Environment Variables
Update the `.env.local` file with your actual credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_supabase_service_role_key

# Tron Configuration
TRON_GRID_API_KEY=your_actual_trongrid_api_key
TRON_NETWORK=shasta  # Use 'mainnet' for production

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select an existing one
3. Navigate to Settings > API
4. Copy the Project URL and Anon Key

### Getting TronGrid API Key
1. Go to [trongrid.io](https://www.trongrid.io)
2. Sign up for an account
3. Generate an API key

## Step 3: Set Up Database Tables
Run the following SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  kyc_status TEXT DEFAULT 'UNVERIFIED' CHECK (kyc_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallets table
CREATE TABLE wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  network TEXT NOT NULL,
  address TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  balance DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  from_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  to_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('SEND', 'RECEIVE', 'DEPOSIT', 'WITHDRAW')),
  amount DECIMAL NOT NULL,
  network TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED')),
  fee DECIMAL DEFAULT 0,
  metadata JSONB,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kyc_documents table
CREATE TABLE kyc_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('PASSPORT', 'ID_CARD', 'DRIVING_LICENSE', 'PROOF_OF_ADDRESS')),
  document_number TEXT,
  document_url TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

## Step 4: Run the Development Server
```bash
npm run dev
```

## Step 5: Access the Application
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Make sure you've run `npm install` in the project directory.

### Issue: Supabase connection errors
**Solution**: Verify your Supabase URL and keys in `.env.local` are correct.

### Issue: TronGrid API errors
**Solution**: Check your TronGrid API key and ensure it has sufficient credits.

### Issue: Port 3000 already in use
**Solution**: Either stop the other service using port 3000 or run the app on a different port:
```bash
npm run dev -- -p 3001
```

## Development Notes
- The application uses Next.js with TypeScript
- Authentication is handled by Supabase
- Blockchain interactions use TronWeb
- The UI is built with Tailwind CSS and Radix UI components