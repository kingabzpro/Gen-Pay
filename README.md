# Gen Pay - Stablecoin Payment Platform

A step-by-step roadmap to build a **full-featured stablecoin payment gateway** using free-tier services like Supabase, TronWeb, Vercel, Resend, and SvelteKit.

---

## 🚀 Project Overview

Gen Pay allows merchants to receive payments in **USDT (TRON network)** via a simple web interface. The system includes:

- Merchant onboarding
- Payment request creation
- Blockchain-based payments
- Automatic verification
- Email notifications
- Webhooks
- Clean, mobile-friendly frontend

**Stack (Free Tier):**

| Layer          | Technology/Service          |
|----------------|----------------------------|
| Frontend       | SvelteKit + v0.dev         |
| Backend        | Supabase (Auth, Database, Functions) |
| Blockchain     | TronWeb (Shasta Testnet / TRON Mainnet) |
| Deployment     | Vercel                     |
| Email          | Resend                     |
| Version Control| GitHub                     |

---

## 🗂️ Phase Breakdown

### **PHASE 0 — Foundations**
**Goal:** Setup accounts and project repo.

1. Create accounts: Supabase, Vercel, Resend, GitHub, v0.dev, TronLink Wallet.
2. Create GitHub repo `gen-pay`.
3. Initialize SvelteKit frontend:
   ```bash
   npm create svelte@latest frontend
   cd frontend
   npm install

4. Deploy empty frontend to Vercel (test deployment).




---

PHASE 1 — Supabase Setup

Goal: Basic backend & authentication.

1. Create a Supabase project.


2. Enable email/password authentication.


3. Add a merchant_profiles table:

id (UUID, PK)

user_id (FK)

business_name

wallet_address

created_at



4. Connect Supabase to SvelteKit:

npm install @supabase/supabase-js

Create src/lib/supabaseClient.ts.




---

PHASE 2 — Merchant System

Goal: Merchant signup and profile setup.

1. Build signup/login pages using v0.dev templates.


2. After signup, push user to “Setup Business” page.


3. Merchant enters:

Business Name

Tron Wallet Address

Logo (optional)



4. Save merchant profile to Supabase.




---

PHASE 3 — Payment Request System

Goal: Payment requests without blockchain.

1. Create payment_requests table:

id (UUID)

merchant_id

amount

currency

status (pending)

created_at



2. Merchant “Create Payment” form.


3. Auto-generate a payment URL:

/pay/{payment_id}


4. Payment page UI shows:

Amount

Merchant Name

“Make Payment” button




(No blockchain yet — just database entries)


---

PHASE 4 — Blockchain Test

Goal: Test TronWeb functionality safely.

1. Install TronWeb:

npm install tronweb


2. Create /test-chain page:

Connect TronLink wallet

Display wallet address

Display TRX / USDT balance (testnet)



3. Use Shasta Testnet:

new TronWeb({
    fullHost: "https://api.shasta.trongrid.io",
    privateKey: ""
})




---

PHASE 5 — Real Payment Flow (Testnet)

Goal: Customers pay USDT (TRON testnet).

1. Update payment page:

“Pay Now” triggers TronLink transaction

Sends USDT to merchant wallet



2. After transaction:

Ask user to click “I have paid”

Update payment_requests status manually





---

PHASE 6 — Automated Verification

Goal: Automatically verify payments.

1. Create Supabase Edge Function: verify_transaction.ts

Check pending payments

Verify blockchain transaction

Update payment_requests → paid

Insert record into transactions table



2. Schedule function to run every 10 seconds.




---

PHASE 7 — Merchant Notifications

Goal: Let merchants get notifications.

1. Email receipts via Resend.


2. Send webhook POST to merchant servers after successful payment.




---

PHASE 8 — UI & Dashboard Polishing

Goal: Make the platform user-friendly.

Transaction history page

Merchant dashboard charts

Settings + API keys

Mobile-first design

Onboarding steps

Help page



---

PHASE 9 — Deployment & Testing

Goal: Launch fully functional platform.

1. Deploy SvelteKit frontend → Vercel


2. Deploy Supabase functions → Supabase


3. Configure domain → Vercel


4. Configure email → Resend


5. End-to-end testing:

1. Merchant signup


2. Create payment request


3. Pay using Tron Testnet


4. Auto verification


5. Receive receipt & webhook






---

⚡ Next Steps / Scaling

Implement private key encryption for wallets

Add rate limiting & security policies

Add analytics and monitoring

Create test suite for critical flows

Switch from Shasta Testnet → Mainnet for production



---

📌 Notes

Free-tier services are sufficient for MVP.

v0.dev templates save time on the frontend.

Using Tron Testnet avoids real money until ready.

Supabase handles backend, authentication, database, and serverless functions → no separate Python backend needed.



---

🔗 Useful Links

Supabase Docs

Vercel Docs

TronWeb Docs

Resend Docs

v0.dev Templates

