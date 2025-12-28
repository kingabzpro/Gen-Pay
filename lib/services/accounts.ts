// Account service for multi-currency accounts
import { createClient } from '@/lib/supabase/server';

export interface Account {
  id: string;
  userId: string;
  currencyCode: 'USD' | 'EUR' | 'GBP';
  accountNumber: string;
  accountType: 'personal' | 'business';
  balance: number;
  status: 'active' | 'inactive' | 'frozen' | 'closed';
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountData {
  currencyCode: 'USD' | 'EUR' | 'GBP';
  accountType?: 'personal' | 'business';
  isPrimary?: boolean;
}

function generateAccountNumber(): string {
  // Generate a 10-digit account number
  const prefix = 'GEN';
  const randomDigits = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return `${prefix}${randomDigits}`;
}

export async function getAccountsByUserId(userId: string): Promise<Account[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((account: any) => ({
    id: account.id,
    userId: account.user_id,
    currencyCode: account.currency_code,
    accountNumber: account.account_number,
    accountType: account.account_type,
    balance: parseFloat(account.balance),
    status: account.status,
    isPrimary: account.is_primary,
    createdAt: new Date(account.created_at),
    updatedAt: new Date(account.updated_at),
  }));
}

export async function getAccountById(accountId: string): Promise<Account | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    currencyCode: data.currency_code,
    accountNumber: data.account_number,
    accountType: data.account_type,
    balance: parseFloat(data.balance),
    status: data.status,
    isPrimary: data.is_primary,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function createAccount(userId: string, data: CreateAccountData): Promise<Account> {
  const supabase = await createClient();

  const accountNumber = generateAccountNumber();
  const isPrimary = data.isPrimary ?? false;

  // If making this account primary, set other accounts of same currency to non-primary
  if (isPrimary) {
    await supabase
      .from('accounts')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .eq('currency_code', data.currencyCode);
  }

  const { data: account, error } = await supabase
    .from('accounts')
    .insert({
      user_id: userId,
      currency_code: data.currencyCode,
      account_number: accountNumber,
      account_type: data.accountType || 'personal',
      balance: 0,
      status: 'active',
      is_primary: isPrimary,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: account.id,
    userId: account.user_id,
    currencyCode: account.currency_code,
    accountNumber: account.account_number,
    accountType: account.account_type,
    balance: parseFloat(account.balance),
    status: account.status,
    isPrimary: account.is_primary,
    createdAt: new Date(account.created_at),
    updatedAt: new Date(account.updated_at),
  };
}

export async function closeAccount(accountId: string): Promise<void> {
  const supabase = await createClient();

  const account = await getAccountById(accountId);
  if (!account) throw new Error('Account not found');

  if (account.balance !== 0) {
    throw new Error('Cannot close account with non-zero balance');
  }

  const { error } = await supabase
    .from('accounts')
    .update({ status: 'closed' })
    .eq('id', accountId);

  if (error) throw error;
}

export async function updateAccountBalance(accountId: string, amount: number): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('accounts')
    .update({ balance: amount })
    .eq('id', accountId);

  if (error) throw error;
}

export async function getAccountByCurrency(userId: string, currencyCode: string): Promise<Account | null> {
  const accounts = await getAccountsByUserId(userId);
  return accounts.find(a => a.currencyCode === currencyCode) || null;
}
