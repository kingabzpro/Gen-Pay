# GEN-PAY

A TRON testnet custodial wallet platform built with Next.js 16 App Router:

- **Frontend:** Next.js 16 + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Supabase (Database + Auth)
- **Blockchain:** TRON Nile Testnet using **USDT (TRC-20)**
- **Security:** AES-256-GCM encrypted private keys (server-side only)

## ⚠️ Important Warnings

### Custodial Wallet Model
This application uses a **custodial wallet model** where:
- Private keys are generated and stored **server-side only**
- Private keys are **encrypted** using AES-256-GCM before storage
- Users **never have access** to their plaintext private keys
- The platform controls all wallet operations on behalf of users

### TRON Testnet Usage
- This application operates on the **TRON Nile Testnet only**
- Testnet tokens have **no real-world value**
- All transactions are for **testing and development purposes only**
- **DO NOT** use with mainnet funds

## What You'll Build

- **Custodial TRON wallet** generation for each user
- **USDT (TRC-20) balance** tracking and display
- **USDT transfers** between users
- **Transaction history** with confirmation status
- **Glassmorphism UI** with red/black/white theme
- **QR code** wallet addresses
- **Row Level Security** (RLS) for data protection

## Security Features

1. **Private Key Encryption**
   - All private keys are encrypted with AES-256-GCM
   - Encryption master key stored in environment variables
   - Keys are only decrypted server-side during transactions

2. **Row Level Security (RLS)**
   - Users can only access their own data
   - Service role operations isolated from client access
   - Database policies enforce data isolation

3. **API Security**
   - Input validation with Zod schemas
   - Authentication required for all wallet operations
   - Protected routes via middleware

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Run the SQL migration:
   ```bash
   # Copy the contents of supabase/migrations/001_initial_schema.sql
   # Paste into Supabase SQL Editor and run
   ```
3. Get your project URL and keys from Supabase Dashboard → Settings → API

### 3. Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Configure Environment Variables

Create `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# TRON (Nile Testnet)
NEXT_PUBLIC_TRON_NILE_RPC=https://api.nileex.io
TRON_USDT_CONTRACT_NILE=TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7
TRON_API_KEY=your_trongrid_api_key

# Encryption
ENCRYPTION_MASTER_KEY=your_generated_base64_key
```

### 5. Get TRON API Key

1. Sign up at https://www.trongrid.io
2. Create a new app
3. Copy the API key to `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── api/
│   │   ├── auth/
│   │   ├── wallet/
│   │   └── transactions/
│   ├── dashboard/
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── glass-card.tsx
│   │   └── warning-badge.tsx
│   └── wallet/
│       ├── WalletDashboard.tsx
│       ├── BalanceCard.tsx
│       ├── SendUsdtModal.tsx
│       └── TransactionTable.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── auth.ts
│   ├── crypto/
│   │   └── encryption.ts
│   └── services/
│       └── wallet.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── middleware.ts
```

## API Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/wallet/create` - Create wallet for user
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/send` - Send USDT to another address
- `GET /api/transactions` - Get transaction history

## Database Schema

### profiles
- User profile information (extends Supabase auth.users)

### wallets
- Encrypted private keys
- Wallet addresses
- USDT and TRX balances

### transactions
- Transaction history
- TX hash, status, confirmations
- Amounts and timestamps

## Testing

### Test Wallet Creation
1. Register a new account
2. Dashboard will show "No wallet found"
3. Click "Create Wallet" to generate a TRON wallet
4. Wallet address and QR code will be displayed

### Test USDT Transfer
1. Create two test accounts
2. Generate wallets for both
3. Use the send form to transfer USDT
4. Check transaction history for both accounts

### Test Balance Sync
- Balance automatically syncs from blockchain when fetching
- Click refresh or navigate away and back to update

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Supabase URL and keys
- TRON API key
- Encryption master key (generate a new one for production)

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Service role key never exposed to client
- [ ] Private keys always encrypted
- [ ] Input validation on all API routes
- [ ] Authentication required for wallet operations
- [ ] HTTPS enabled in production
- [ ] Environment variables secured

## Tech Stack Details

- **Next.js 16**: App Router, Server Components, API Routes
- **Supabase**: PostgreSQL database, Authentication, Row Level Security
- **TRON**: Nile testnet, TRC-20 USDT contract
- **TronWeb**: TRON blockchain interaction
- **Tailwind CSS 4**: Styling with CSS variables
- **shadcn/ui**: Component library
- **Framer Motion**: Animations
- **Lucide React**: Icons

## License

MIT
