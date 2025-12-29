# GEN-PAY Backend Setup & Seeding Guide

## Overview

This guide explains the backend fixes and seed data implementation for GEN-PAY.

## What Was Implemented

### 1. Transaction Service
Created a new comprehensive transaction service (`lib/services/transactions.ts`) with:
- Full transaction CRUD operations
- Support for multiple transaction types (credit, debit, transfer_in, transfer_out, card_payment)
- Helper functions for generating realistic merchant data
- Random transaction amount and date generators
- Filtering by user, account, or card

### 2. Enhanced Transfer Service
Updated transfers service (`lib/services/transfers.ts`) to:
- Automatically deduct balance from source account
- Add balance to destination account (for internal transfers)
- Create transaction records automatically when transfers are completed
- Proper exchange rate handling
- Fee calculation

### 3. Account Balance Helpers
Added to accounts service (`lib/services/accounts.ts`):
- `addFunds(accountId, amount)` - Add money to account
- `deductFunds(accountId, amount)` - Remove money from account
- `transferFunds(fromAccountId, toAccountId, amount)` - Transfer between accounts

### 4. Fixed API Routes
Updated all API routes to use proper async params for Next.js 16:
- `app/api/accounts/[id]/route.ts`
- `app/api/cards/[id]/route.ts`
- `app/api/transfers/[id]/route.ts`
- `app/api/transactions/route.ts`
- `app/api/transactions/[id]/route.ts` (NEW)

### 5. Seed Script
Created comprehensive seed script (`scripts/seed.ts`) that:
- Creates 3 test users with hardcoded credentials
- Creates multi-currency accounts for each user
- Creates virtual cards for each account
- Generates 60 dummy transactions (20 per user)
- Creates inter-user transfers
- All within last 30 days

### 6. Database Helpers
Added SQL migration (`supabase/migrations/002_transaction_helpers.sql`) with:
- Atomic balance update functions
- Transfer funds functions
- Add/deduct funds functions

## Setup Instructions

### Prerequisites

Make sure you have your `.env.local` file configured with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_key
```

**Important:** Use the **service role key** for the seed script, not the anon key. You can find it in Supabase Dashboard → Settings → API.

### Running the Seed Script

1. Install dependencies:
```bash
npm install
```

2. Run the seed script:
```bash
npm run seed
```

The script will:
- Clean up any previous seed data
- Create 3 test users
- Create accounts, cards, and transactions for each
- Create transfers between users
- Display test user credentials at the end

### Test User Credentials

After running the seed script, you can login with these accounts:

```
User 1:
  Email: john@example.com
  Password: Test123456!
  Name: John Doe
  Balances: $10,000 USD, €8,000 EUR, £7,000 GBP

User 2:
  Email: jane@example.com
  Password: Test123456!
  Name: Jane Smith
  Balances: $5,000 USD, €4,000 EUR, £3,500 GBP

User 3:
  Email: bob@example.com
  Password: Test123456!
  Name: Bob Johnson
  Balances: $15,000 USD, €12,000 EUR, £10,000 GBP
```

Each user has:
- 3 currency accounts (USD, EUR, GBP)
- 3 virtual cards (1 per account)
- 20 transactions (5 credits, 10 debits, 3 transfers, 2 card payments)
- All transactions within the last 30 days
- Realistic merchant names, categories, and descriptions

## Database Migration

Before running the seed script, you should run the transaction helpers migration:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/002_transaction_helpers.sql`
4. Run the SQL

This will create helper functions for atomic balance operations.

## Verification Steps

After seeding, verify the data:

1. **Check Users**
   - Supabase Dashboard → Authentication
   - You should see 3 users

2. **Check Profiles**
   - Supabase Dashboard → Table Editor → profiles
   - You should see 3 profile records

3. **Check Accounts**
   - Supabase Dashboard → Table Editor → accounts
   - You should see 9 accounts (3 per user)

4. **Check Cards**
   - Supabase Dashboard → Table Editor → cards
   - You should see 9 cards (1 per account)

5. **Check Transactions**
   - Supabase Dashboard → Table Editor → transactions
   - You should see 60+ transactions

6. **Check Transfers**
   - Supabase Dashboard → Table Editor → transfers
   - You should see 3+ transfer records

7. **Test the App**
   - Run `npm run dev`
   - Login with one of the test users
   - Navigate to Dashboard
   - You should see accounts with balances
   - Switch to Cards tab to see virtual cards
   - Switch to Transfers tab (feature coming soon)

## API Endpoints

### Accounts
- `GET /api/accounts` - Get all user accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/[id]` - Get account details
- `DELETE /api/accounts/[id]` - Close account

### Cards
- `GET /api/cards` - Get all user cards
- `POST /api/cards` - Create new card
- `GET /api/cards/[id]` - Get card details
- `PATCH /api/cards/[id]` - Update card (freeze/unfreeze, set limits)
- `DELETE /api/cards/[id]` - Delete card

### Transactions
- `GET /api/accounts` - Get user transactions
  - Query params: `?accountId=xxx`, `?cardId=xxx`, `?limit=10`
- `GET /api/transactions/[id]` - Get transaction details

### Transfers
- `GET /api/transfers` - Get transfer history
- `POST /api/transfers` - Create new transfer
- `GET /api/transfers/[id]` - Get transfer details
- `POST /api/transfers/[id]` - Cancel transfer (used via POST for now)

### Exchange Rates
- `GET /api/exchange-rates` - Get all rates
- `POST /api/exchange-rates/convert` - Convert currency

## Transaction Types

### credit
Money added to account (deposits, salary, refunds, etc.)

### debit
Money spent from account (purchases, withdrawals, etc.)

### transfer_in
Money received via transfer

### transfer_out
Money sent via transfer

### card_payment
Payment made using virtual card

## Merchant Categories

The seed script uses these categories:
- Shopping
- Entertainment
- Transportation
- Food & Drink
- Technology
- Groceries
- Cash
- Travel
- Home
- Banking

## Troubleshooting

### Seed script fails with authentication error
- Make sure `SUPABASE_SECRET_KEY` is set in `.env.local`
- Verify the key is the service role key, not anon key
- Check the Supabase URL is correct

### Transactions not showing in app
- Make sure you're logged in as one of the test users
- Check browser console for API errors
- Verify the transactions table has data in Supabase

### Balance updates not working
- Ensure the transaction helpers migration was run
- Check that account balances are sufficient before transfers

## Next Steps

1. Run the database migration (`002_transaction_helpers.sql`)
2. Run the seed script (`npm run seed`)
3. Login with test credentials and explore the dashboard
4. Test creating new accounts and cards
5. Test making transfers between users
6. Review transaction history

## Notes

- All transactions in seed data are marked as 'completed'
- Virtual card numbers are test numbers starting with '4'
- All card expiry dates are 3 years from now
- Transaction amounts are randomized within realistic ranges
- Exchange rates in seed are set to 1.0 for same-currency transfers
