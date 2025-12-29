// Transactions service
import { createClient } from '@/lib/supabase/server';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  cardId?: string;
  transferId?: string;
  transactionType: 'credit' | 'debit' | 'transfer_in' | 'transfer_out' | 'card_payment';
  amount: number;
  currency: string;
  merchantName?: string;
  category?: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface CreateTransactionData {
  userId: string;
  accountId: string;
  cardId?: string;
  transferId?: string;
  transactionType: 'credit' | 'debit' | 'transfer_in' | 'transfer_out' | 'card_payment';
  amount: number;
  currency: string;
  merchantName?: string;
  category?: string;
  description?: string;
  status?: 'pending' | 'completed' | 'failed';
}

export interface MerchantData {
  name: string;
  category: string;
  description: string;
}

const MERCHANTS: MerchantData[] = [
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
  { name: 'Deposit', category: 'Banking', description: 'Direct deposit' },
  { name: 'Salary', category: 'Banking', description: 'Monthly salary' },
  { name: 'Refund', category: 'Shopping', description: 'Purchase refund' },
];

export function generateMerchantData(): MerchantData {
  return MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
}

export function generateRandomAmount(currency: string): number {
  const ranges: { [key: string]: [number, number] } = {
    USD: [5, 500],
    EUR: [5, 450],
    GBP: [4, 400],
  };

  const [min, max] = ranges[currency] || [5, 500];
  return Math.floor((Math.random() * (max - min) + min) * 100) / 100;
}

export function generateTransactionDate(daysBack: number = 30): Date {
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

export async function getTransactionsByUserId(userId: string): Promise<Transaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((transaction: any) => ({
    id: transaction.id,
    userId: transaction.user_id,
    accountId: transaction.account_id,
    cardId: transaction.card_id,
    transferId: transaction.transfer_id,
    transactionType: transaction.transaction_type,
    amount: parseFloat(transaction.amount),
    currency: transaction.currency,
    merchantName: transaction.merchant_name,
    category: transaction.category,
    description: transaction.description,
    status: transaction.status,
    createdAt: new Date(transaction.created_at),
  }));
}

export async function getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((transaction: any) => ({
    id: transaction.id,
    userId: transaction.user_id,
    accountId: transaction.account_id,
    cardId: transaction.card_id,
    transferId: transaction.transfer_id,
    transactionType: transaction.transaction_type,
    amount: parseFloat(transaction.amount),
    currency: transaction.currency,
    merchantName: transaction.merchant_name,
    category: transaction.category,
    description: transaction.description,
    status: transaction.status,
    createdAt: new Date(transaction.created_at),
  }));
}

export async function getTransactionsByCard(cardId: string): Promise<Transaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((transaction: any) => ({
    id: transaction.id,
    userId: transaction.user_id,
    accountId: transaction.account_id,
    cardId: transaction.card_id,
    transferId: transaction.transfer_id,
    transactionType: transaction.transaction_type,
    amount: parseFloat(transaction.amount),
    currency: transaction.currency,
    merchantName: transaction.merchant_name,
    category: transaction.category,
    description: transaction.description,
    status: transaction.status,
    createdAt: new Date(transaction.created_at),
  }));
}

export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    accountId: data.account_id,
    cardId: data.card_id,
    transferId: data.transfer_id,
    transactionType: data.transaction_type,
    amount: parseFloat(data.amount),
    currency: data.currency,
    merchantName: data.merchant_name,
    category: data.category,
    description: data.description,
    status: data.status,
    createdAt: new Date(data.created_at),
  };
}

export async function createTransaction(data: CreateTransactionData): Promise<Transaction> {
  const supabase = await createClient();

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: data.userId,
      account_id: data.accountId,
      card_id: data.cardId,
      transfer_id: data.transferId,
      transaction_type: data.transactionType,
      amount: data.amount,
      currency: data.currency,
      merchant_name: data.merchantName,
      category: data.category,
      description: data.description,
      status: data.status || 'completed',
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: transaction.id,
    userId: transaction.user_id,
    accountId: transaction.account_id,
    cardId: transaction.card_id,
    transferId: transaction.transfer_id,
    transactionType: transaction.transaction_type,
    amount: parseFloat(transaction.amount),
    currency: transaction.currency,
    merchantName: transaction.merchant_name,
    category: transaction.category,
    description: transaction.description,
    status: transaction.status,
    createdAt: new Date(transaction.created_at),
  };
}
