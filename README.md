# GEN-PAY

A multi-currency personal banking platform built with Next.js 16 App Router, inspired by Wise:

- **Frontend:** Next.js 16 + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Supabase (Database + Auth)
- **Features:** Multi-currency accounts (USD, EUR, GBP), Virtual Debit Cards, International Transfers
- **Security:** Row Level Security (RLS), Secure API routes

## Features

### Multi-Currency Banking
- **Personal Accounts:** Hold and manage multiple currency accounts (USD, EUR, GBP)
- **Real Exchange Rates:** Live currency conversion rates
- **Account Management:** Open/close currency accounts, view balances

### Virtual Debit Cards
- **Virtual Cards:** Generate virtual debit cards for online purchases
- **Card Management:** View card details, set spending limits, freeze/unfreeze cards
- **Transaction History:** Track all card transactions

### International Transfers
- **Send Money:** Transfer money to other GEN-PAY users
- **Bank Transfers:** Send to external bank accounts
- **Fee Calculator:** View fees before sending
- **Transfer Status:** Track transfer progress

### Additional Wise-like Features
- **Payment Links:** Create shareable payment links
- **Scheduled Payments:** Set up recurring transfers
- **Transaction Categorization:** Auto-categorize spending
- **Spending Analytics:** Visual insights and reports
- **Multi-Language Support:** International user support

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Run the SQL migrations:
    ```bash
    # 1. Run supabase/migrations/001_initial_schema.sql
    # 2. Run supabase/migrations/002_transaction_helpers.sql
    # Copy and paste each into Supabase SQL Editor
    ```
3. Get your project URL and keys from Supabase Dashboard → Settings → API

### 3. Configure Environment Variables

Create `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key

# Exchange Rate API (optional - uses free tier)
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key

# Card Issuing API (optional - for virtual card integration)
NEXT_PUBLIC_CARD_ISSUING_API_KEY=your_card_issuing_api_key
```

**Important:** For the seed script, ensure `SUPABASE_SECRET_KEY` is set to your service role key (not the anon key).

### 4. Seed the Database

```bash
npm run seed
```

This will create:
- 3 test users with hardcoded credentials
- Multi-currency accounts for each user
- Virtual cards for each account
- 60+ dummy transactions
- Inter-user transfers

See `SEEDING_GUIDE.md` for detailed information about the seed script.

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

Login with one of the test accounts created by the seed script:
- john@example.com / Test123456!
- jane@example.com / Test123456!
- bob@example.com / Test123456!

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── api/
│   │   ├── accounts/
│   │   ├── cards/
│   │   ├── transfers/
│   │   └── exchange-rates/
│   ├── dashboard/
│   ├── transfers/
│   ├── cards/
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── glass-card.tsx
│   │   └── warning-badge.tsx
│   ├── accounts/
│   │   ├── AccountCard.tsx
│   │   ├── CreateAccountModal.tsx
│   │   └── AccountList.tsx
│   ├── cards/
│   │   ├── VirtualCard.tsx
│   │   ├── CardDetails.tsx
│   │   └── CreateCardModal.tsx
│   ├── transfers/
│   │   ├── TransferForm.tsx
│   │   ├── TransferHistory.tsx
│   │   └── FeeCalculator.tsx
│   └── analytics/
│       ├── SpendingChart.tsx
│       └── CategoryBreakdown.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── auth.ts
│   ├── services/
│   │   ├── accounts.ts
│   │   ├── cards.ts
│   │   ├── transfers.ts
│   │   └── exchange-rates.ts
│   └── utils/
│       └── format-currency.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── middleware.ts
```

## API Routes

### Accounts
- `GET /api/accounts` - Get all user accounts
- `POST /api/accounts` - Create new currency account
- `GET /api/accounts/[id]` - Get account details
- `DELETE /api/accounts/[id]` - Close account

### Cards
- `GET /api/cards` - Get all virtual cards
- `POST /api/cards` - Create new virtual card
- `GET /api/cards/[id]` - Get card details
- `PATCH /api/cards/[id]` - Update card (freeze/unfreeze, set limits)
- `DELETE /api/cards/[id]` - Delete card

### Transfers
- `GET /api/transfers` - Get transfer history
- `POST /api/transfers` - Create new transfer
- `GET /api/transfers/[id]` - Get transfer details
- `POST /api/transfers/[id]/cancel` - Cancel pending transfer

### Exchange Rates
- `GET /api/exchange-rates` - Get current exchange rates
- `POST /api/exchange-rates/convert` - Convert between currencies
- `GET /api/exchange-rates/history` - Get historical rates

## Database Schema

### profiles
- User profile information (extends Supabase auth.users)

### accounts
- Multi-currency accounts (USD, EUR, GBP)
- Account balances and limits
- Account status

### cards
- Virtual debit cards
- Card details (last 4 digits, expiry, CVV)
- Card status and limits

### transfers
- Transfer history
- Exchange rates used
- Status tracking

### transactions
- Individual transactions
- Categories and merchants
- Transaction metadata

## Security Features

1. **Row Level Security (RLS)**
   - Users can only access their own data
   - Service role operations isolated from client access
   - Database policies enforce data isolation

2. **API Security**
   - Input validation with Zod schemas
   - Authentication required for all operations
   - Protected routes via middleware

3. **Card Security**
   - Sensitive card data encrypted
   - Card details only shown when authenticated
   - One-time view for full card details

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Supabase URL and keys
- Exchange rate API key (for live rates)
- Card issuing API key (for virtual card integration)

## Tech Stack Details

- **Next.js 16**: App Router, Server Components, API Routes
- **Supabase**: PostgreSQL database, Authentication, Row Level Security
- **Tailwind CSS 4**: Styling with CSS variables
- **shadcn/ui**: Component library
- **Framer Motion**: Animations
- **Lucide React**: Icons
- **Recharts**: Analytics charts

## License

MIT
