import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

dotenv.config();

const envPath = resolve('.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
} catch (error) {
  console.warn('Could not read .env.local file, using process.env variables');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

console.log('Checking environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING');
console.log('SUPABASE_SECRET_KEY:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing Supabase environment variables');
  console.error('Please ensure .env.local contains:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.error('  SUPABASE_SECRET_KEY=your_supabase_service_role_key');
  console.error('\nNote: SUPABASE_SECRET_KEY should be the SERVICE ROLE key, not the anon key.');
  console.error('You can find it in: Supabase Dashboard → Settings → API');
  process.exit(1);
}

console.log('✓ Environment variables loaded successfully\n');

const supabase = createClient(supabaseUrl, supabaseKey);

const testUsers = [
  {
    email: 'john@example.com',
    password: 'Test123456!',
    fullName: 'John Doe',
    initialBalances: { USD: 10000, EUR: 8000, GBP: 7000 },
  },
  {
    email: 'jane@example.com',
    password: 'Test123456!',
    fullName: 'Jane Smith',
    initialBalances: { USD: 5000, EUR: 4000, GBP: 3500 },
  },
  {
    email: 'bob@example.com',
    password: 'Test123456!',
    fullName: 'Bob Johnson',
    initialBalances: { USD: 15000, EUR: 12000, GBP: 10000 },
  },
];

const merchants = [
  { name: 'Amazon', category: 'Shopping', description: 'Online purchase at Amazon' },
  { name: 'Netflix', category: 'Entertainment', description: 'Monthly subscription' },
  { name: 'Uber', category: 'Transportation', description: 'Ride service' },
  { name: 'Starbucks', category: 'Food & Drink', description: 'Coffee and food' },
  { name: 'Apple Store', category: 'Technology', description: 'App Store purchase' },
  { name: 'Spotify', category: 'Entertainment', description: 'Premium subscription' },
  { name: 'Whole Foods', category: 'Groceries', description: 'Grocery shopping' },
  { name: 'ATM Withdrawal', category: 'Cash', description: 'ATM cash withdrawal' },
  { name: 'Target', category: 'Shopping', description: 'Retail store purchase' },
  { name: 'Walmart', category: 'Shopping', description: 'Retail store purchase' },
  { name: 'Airbnb', category: 'Travel', description: 'Travel accommodation' },
  { name: 'Uber Eats', category: 'Food & Drink', description: 'Food delivery' },
  { name: 'Lyft', category: 'Transportation', description: 'Ride service' },
  { name: 'Best Buy', category: 'Technology', description: 'Electronics purchase' },
  { name: 'McDonalds', category: 'Food & Drink', description: 'Fast food' },
  { name: 'Subway', category: 'Food & Drink', description: 'Restaurant' },
  { name: 'Shell', category: 'Transportation', description: 'Gas station' },
  { name: 'Costco', category: 'Groceries', description: 'Wholesale purchase' },
  { name: 'Home Depot', category: 'Home', description: 'Home improvement' },
  { name: 'IKEA', category: 'Home', description: 'Furniture purchase' },
];

const creditMerchants = [
  { name: 'Direct Deposit', category: 'Banking', description: 'Salary deposit' },
  { name: 'Payroll', category: 'Banking', description: 'Monthly salary' },
  { name: 'Refund', category: 'Shopping', description: 'Purchase refund' },
  { name: 'Interest', category: 'Banking', description: 'Account interest' },
  { name: 'Bonus', category: 'Banking', description: 'Work bonus' },
];

function generateAccountNumber(): string {
  const prefix = 'GEN';
  const randomDigits = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return `${prefix}${randomDigits}`;
}

function generateCardNumber(): string {
  let cardNumber = '4';
  for (let i = 0; i < 15; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  return cardNumber;
}

function generateCVV(): string {
  return Math.floor(Math.random() * 900 + 100).toString();
}

function getExpiryDate(): { month: number; year: number } {
  const now = new Date();
  const year = now.getFullYear() + 3;
  const month = Math.floor(Math.random() * 12) + 1;
  return { month, year };
}

function generateRandomAmount(currency: string): number {
  const ranges: { [key: string]: [number, number] } = {
    USD: [5, 500],
    EUR: [5, 450],
    GBP: [4, 400],
  };
  const [min, max] = ranges[currency] || [5, 500];
  return Math.floor((Math.random() * (max - min) + min) * 100) / 100;
}

function generateTransactionDate(daysBack: number = 30): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * daysBack);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
  
  return date;
}

async function cleanupPreviousSeedData() {
  console.log('Cleaning up previous seed data...');
  
  for (const user of testUsers) {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existingUser = users?.find(u => u.email === user.email);
    
    if (existingUser) {
      console.log(`Deleting user: ${user.email}`);
      await supabase.auth.admin.deleteUser(existingUser.id);
    }
  }
  
  console.log('Cleanup completed\n');
}

async function createTestUsers() {
  console.log('Creating test users...');
  const createdUsers: any[] = [];
  
  for (const user of testUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.fullName,
      },
    });
    
    if (error) {
      console.error(`Error creating user ${user.email}:`, error.message);
      continue;
    }
    
    console.log(`Created user: ${user.email} (${data.user?.id})`);
    createdUsers.push({ ...user, id: data.user?.id });
  }
  
  console.log('');
  return createdUsers;
}

async function createAccounts(userId: string, balances: { USD: number; EUR: number; GBP: number }) {
  console.log(`Creating accounts for user: ${userId}`);
  const currencies: Array<{ code: 'USD' | 'EUR' | 'GBP'; balance: number }> = [
    { code: 'USD', balance: balances.USD },
    { code: 'EUR', balance: balances.EUR },
    { code: 'GBP', balance: balances.GBP },
  ];
  
  const accounts: any[] = [];
  
  for (let i = 0; i < currencies.length; i++) {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        currency_code: currencies[i].code,
        account_number: generateAccountNumber(),
        account_type: 'personal',
        balance: currencies[i].balance,
        status: 'active',
        is_primary: i === 0,
      })
      .select()
      .single();
    
    if (error) {
      console.error(`Error creating ${currencies[i].code} account:`, error.message);
      continue;
    }
    
    console.log(`  Created ${currencies[i].code} account: ${data.account_number} (${currencies[i].balance})`);
    accounts.push(data);
  }
  
  console.log('');
  return accounts;
}

async function createVirtualCards(userId: string, accounts: any[]) {
  console.log(`Creating virtual cards for user: ${userId}`);
  const cards: any[] = [];
  
  for (const account of accounts) {
    const { month, year } = getExpiryDate();
    
    const { data, error } = await supabase
      .from('cards')
      .insert({
        user_id: userId,
        account_id: account.id,
        card_number: generateCardNumber(),
        card_holder_name: `${account.currency_code} Card`,
        expiry_month: month,
        expiry_year: year,
        cvv: generateCVV(),
        card_type: 'virtual',
        status: 'active',
        daily_limit: 5000,
        monthly_limit: 20000,
      })
      .select()
      .single();
    
    if (error) {
      console.error(`Error creating card for ${account.currency_code} account:`, error.message);
      continue;
    }
    
    console.log(`  Created ${account.currency_code} virtual card: **** **** **** ${data.card_number.slice(-4)}`);
    cards.push({ ...data, currency_code: account.currency_code });
  }
  
  console.log('');
  return cards;
}

async function createDummyTransactions(userId: string, accounts: any[], cards: any[]) {
  console.log(`Creating dummy transactions for user: ${userId}`);
  
  const creditCount = 5;
  const debitCount = 10;
  const cardPaymentCount = 2;
  const transferInCount = 2;
  const transferOutCount = 1;
  
  const totalTransactions = creditCount + debitCount + cardPaymentCount + transferInCount + transferOutCount;
  let createdCount = 0;
  
  for (let i = 0; i < creditCount; i++) {
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    const merchant = creditMerchants[Math.floor(Math.random() * creditMerchants.length)];
    const amount = generateRandomAmount(account.currency_code);
    const date = generateTransactionDate();
    
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        account_id: account.id,
        card_id: null,
        transaction_type: 'credit',
        amount: amount,
        currency: account.currency_code,
        merchant_name: merchant.name,
        category: merchant.category,
        description: merchant.description,
        status: 'completed',
        created_at: date.toISOString(),
      });
    
    if (error) {
      console.error(`  Error creating credit transaction:`, error.message);
    } else {
      createdCount++;
    }
  }
  
  for (let i = 0; i < debitCount; i++) {
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const amount = generateRandomAmount(account.currency_code);
    const date = generateTransactionDate();
    
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        account_id: account.id,
        card_id: null,
        transaction_type: 'debit',
        amount: amount,
        currency: account.currency_code,
        merchant_name: merchant.name,
        category: merchant.category,
        description: merchant.description,
        status: 'completed',
        created_at: date.toISOString(),
      });
    
    if (error) {
      console.error(`  Error creating debit transaction:`, error.message);
    } else {
      createdCount++;
    }
  }
  
  for (let i = 0; i < cardPaymentCount; i++) {
    const card = cards[Math.floor(Math.random() * cards.length)];
    const account = accounts.find(a => a.id === card.account_id);
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const amount = generateRandomAmount(account.currency_code);
    const date = generateTransactionDate();
    
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        account_id: account.id,
        card_id: card.id,
        transaction_type: 'card_payment',
        amount: amount,
        currency: account.currency_code,
        merchant_name: merchant.name,
        category: merchant.category,
        description: merchant.description,
        status: 'completed',
        created_at: date.toISOString(),
      });
    
    if (error) {
      console.error(`  Error creating card payment transaction:`, error.message);
    } else {
      createdCount++;
    }
  }
  
  for (let i = 0; i < transferInCount; i++) {
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    const amount = generateRandomAmount(account.currency_code);
    const date = generateTransactionDate();
    
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        account_id: account.id,
        card_id: null,
        transaction_type: 'transfer_in',
        amount: amount,
        currency: account.currency_code,
        merchant_name: 'Received transfer',
        category: 'Transfer',
        description: 'Money received from another user',
        status: 'completed',
        created_at: date.toISOString(),
      });
    
    if (error) {
      console.error(`  Error creating transfer_in transaction:`, error.message);
    } else {
      createdCount++;
    }
  }
  
  for (let i = 0; i < transferOutCount; i++) {
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    const amount = generateRandomAmount(account.currency_code);
    const date = generateTransactionDate();
    
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        account_id: account.id,
        card_id: null,
        transaction_type: 'transfer_out',
        amount: amount,
        currency: account.currency_code,
        merchant_name: 'Sent transfer',
        category: 'Transfer',
        description: 'Money sent to another user',
        status: 'completed',
        created_at: date.toISOString(),
      });
    
    if (error) {
      console.error(`  Error creating transfer_out transaction:`, error.message);
    } else {
      createdCount++;
    }
  }
  
  console.log(`  Created ${createdCount}/${totalTransactions} transactions\n`);
}

async function createTransfersBetweenUsers(users: any[]) {
  console.log('Creating transfers between users...');
  
  const transferConfigs = [
    { from: 0, to: 1, amount: 500, currency: 'USD', type: 'internal' },
    { from: 1, to: 2, amount: 400, currency: 'EUR', type: 'internal' },
    { from: 2, to: 0, amount: 300, currency: 'GBP', type: 'internal' },
  ];
  
  let createdCount = 0;
  
  for (const config of transferConfigs) {
    const fromUser = users[config.from];
    const toUser = users[config.to];
    
    const { data: fromAccounts } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', fromUser.id)
      .eq('currency_code', config.currency)
      .single();
    
    const { data: toAccounts } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', toUser.id)
      .eq('currency_code', config.currency)
      .single();
    
    if (!fromAccounts || !toAccounts) {
      console.error(`  Error finding accounts for transfer from ${fromUser.email} to ${toUser.email}`);
      continue;
    }
    
    const { error } = await supabase
      .from('transfers')
      .insert({
        user_id: fromUser.id,
        from_account_id: fromAccounts.id,
        to_account_id: toAccounts.id,
        recipient_email: toUser.email,
        recipient_name: toUser.fullName,
        amount: config.amount,
        from_currency: config.currency,
        to_currency: config.currency,
        exchange_rate: 1,
        fee: 2.5,
        total_amount: config.amount + 2.5,
        reference: `Transfer from ${fromUser.fullName} to ${toUser.fullName}`,
        status: 'completed',
        transfer_type: 'internal',
        estimated_arrival: new Date().toISOString(),
      });
    
    if (error) {
      console.error(`  Error creating transfer from ${fromUser.email} to ${toUser.email}:`, error.message);
    } else {
      createdCount++;
      console.log(`  Created transfer: ${fromUser.email} -> ${toUser.email} (${config.amount} ${config.currency})`);
    }
  }
  
  console.log(`Created ${createdCount}/${transferConfigs.length} transfers\n`);
}

async function main() {
  console.log('========================================');
  console.log('GEN-PAY Database Seed Script');
  console.log('========================================\n');
  
  try {
    await cleanupPreviousSeedData();
    
    const users = await createTestUsers();
    
    for (const user of users) {
      const accounts = await createAccounts(user.id, user.initialBalances);
      const cards = await createVirtualCards(user.id, accounts);
      await createDummyTransactions(user.id, accounts, cards);
    }
    
    await createTransfersBetweenUsers(users);
    
    console.log('========================================');
    console.log('Seed completed successfully!');
    console.log('========================================\n');
    
    console.log('Test User Credentials:');
    console.log('----------------------');
    for (const user of testUsers) {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Name: ${user.fullName}`);
      console.log('');
    }
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main();
