// Transfers service for international transfers
import { createClient } from '@/lib/supabase/server';

export interface Transfer {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId?: string;
  recipientEmail?: string;
  recipientName?: string;
  recipientIban?: string;
  recipientBic?: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate?: number;
  fee: number;
  totalAmount: number;
  reference?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transferType: 'internal' | 'external' | 'card_payment';
  estimatedArrival?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransferData {
  fromAccountId: string;
  toAccountId?: string;
  recipientEmail?: string;
  recipientName?: string;
  recipientIban?: string;
  recipientBic?: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  reference?: string;
  transferType: 'internal' | 'external' | 'card_payment';
}

export async function getTransfersByUserId(userId: string): Promise<Transfer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((transfer: any) => ({
    id: transfer.id,
    userId: transfer.user_id,
    fromAccountId: transfer.from_account_id,
    toAccountId: transfer.to_account_id,
    recipientEmail: transfer.recipient_email,
    recipientName: transfer.recipient_name,
    recipientIban: transfer.recipient_iban,
    recipientBic: transfer.recipient_bic,
    amount: parseFloat(transfer.amount),
    fromCurrency: transfer.from_currency,
    toCurrency: transfer.to_currency,
    exchangeRate: transfer.exchange_rate ? parseFloat(transfer.exchange_rate) : undefined,
    fee: parseFloat(transfer.fee),
    totalAmount: parseFloat(transfer.total_amount),
    reference: transfer.reference,
    status: transfer.status,
    transferType: transfer.transfer_type,
    estimatedArrival: transfer.estimated_arrival ? new Date(transfer.estimated_arrival) : undefined,
    createdAt: new Date(transfer.created_at),
    updatedAt: new Date(transfer.updated_at),
  }));
}

export async function getTransferById(transferId: string): Promise<Transfer | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .eq('id', transferId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    fromAccountId: data.from_account_id,
    toAccountId: data.to_account_id,
    recipientEmail: data.recipient_email,
    recipientName: data.recipient_name,
    recipientIban: data.recipient_iban,
    recipientBic: data.recipient_bic,
    amount: parseFloat(data.amount),
    fromCurrency: data.from_currency,
    toCurrency: data.to_currency,
    exchangeRate: data.exchange_rate ? parseFloat(data.exchange_rate) : undefined,
    fee: parseFloat(data.fee),
    totalAmount: parseFloat(data.total_amount),
    reference: data.reference,
    status: data.status,
    transferType: data.transfer_type,
    estimatedArrival: data.estimated_arrival ? new Date(data.estimated_arrival) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('exchange_rates')
    .select('rate')
    .eq('from_currency', fromCurrency)
    .eq('to_currency', toCurrency)
    .single();

  if (error) return null;
  return parseFloat(data.rate);
}

async function calculateTransferFee(amount: number, transferType: 'internal' | 'external' | 'card_payment'): number {
  // Simple fee structure:
  // - Internal: 0.5% (minimum $1)
  // - External: 1.5% (minimum $5)
  // - Card payment: 2% (minimum $2)

  let feeRate: number;
  let minFee: number;

  switch (transferType) {
    case 'internal':
      feeRate = 0.005;
      minFee = 1;
      break;
    case 'external':
      feeRate = 0.015;
      minFee = 5;
      break;
    case 'card_payment':
      feeRate = 0.02;
      minFee = 2;
      break;
  }

  const calculatedFee = amount * feeRate;
  return Math.max(calculatedFee, minFee);
}

export async function createTransfer(userId: string, data: CreateTransferData): Promise<Transfer> {
  const supabase = await createClient();

  const fee = await calculateTransferFee(data.amount, data.transferType);
  const totalAmount = data.amount + fee;

  let exchangeRate: number | undefined;
  let estimatedArrival: Date | undefined;

  if (data.fromCurrency !== data.toCurrency) {
    exchangeRate = await getExchangeRate(data.fromCurrency, data.toCurrency);
    if (!exchangeRate) {
      throw new Error(`Exchange rate not available for ${data.fromCurrency} to ${data.toCurrency}`);
    }
  }

  // Set estimated arrival based on transfer type
  const now = new Date();
  if (data.transferType === 'internal') {
    estimatedArrival = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
  } else {
    estimatedArrival = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
  }

  const { data: transfer, error } = await supabase
    .from('transfers')
    .insert({
      user_id: userId,
      from_account_id: data.fromAccountId,
      to_account_id: data.toAccountId,
      recipient_email: data.recipientEmail,
      recipient_name: data.recipientName,
      recipient_iban: data.recipientIban,
      recipient_bic: data.recipientBic,
      amount: data.amount,
      from_currency: data.fromCurrency,
      to_currency: data.toCurrency,
      exchange_rate: exchangeRate,
      fee: fee,
      total_amount: totalAmount,
      reference: data.reference,
      status: 'pending',
      transfer_type: data.transferType,
      estimated_arrival: estimatedArrival?.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: transfer.id,
    userId: transfer.user_id,
    fromAccountId: transfer.from_account_id,
    toAccountId: transfer.to_account_id,
    recipientEmail: transfer.recipient_email,
    recipientName: transfer.recipient_name,
    recipientIban: transfer.recipient_iban,
    recipientBic: transfer.recipient_bic,
    amount: parseFloat(transfer.amount),
    fromCurrency: transfer.from_currency,
    toCurrency: transfer.to_currency,
    exchangeRate: transfer.exchange_rate ? parseFloat(transfer.exchange_rate) : undefined,
    fee: parseFloat(transfer.fee),
    totalAmount: parseFloat(transfer.total_amount),
    reference: transfer.reference,
    status: transfer.status,
    transferType: transfer.transfer_type,
    estimatedArrival: transfer.estimated_arrival ? new Date(transfer.estimated_arrival) : undefined,
    createdAt: new Date(transfer.created_at),
    updatedAt: new Date(transfer.updated_at),
  };
}

export async function cancelTransfer(transferId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('transfers')
    .update({ status: 'cancelled' })
    .eq('id', transferId)
    .eq('status', 'pending');

  if (error) throw error;
}

export async function updateTransferStatus(transferId: string, status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('transfers')
    .update({ status })
    .eq('id', transferId);

  if (error) throw error;
}
