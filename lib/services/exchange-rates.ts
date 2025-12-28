// Exchange rates service
import { createClient } from '@/lib/supabase/server';

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  updatedAt: Date;
}

export async function getAllExchangeRates(): Promise<ExchangeRate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('exchange_rates')
    .select('*')
    .order('from_currency', { ascending: true });

  if (error) throw error;

  return data.map((rate: any) => ({
    fromCurrency: rate.from_currency,
    toCurrency: rate.to_currency,
    rate: parseFloat(rate.rate),
    updatedAt: new Date(rate.updated_at),
  }));
}

export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
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

export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  if (fromCurrency === toCurrency) return amount;

  const rate = await getExchangeRate(fromCurrency, toCurrency);
  if (!rate) {
    throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
  }

  return amount * rate;
}

export async function updateExchangeRate(fromCurrency: string, toCurrency: string, rate: number): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('exchange_rates')
    .upsert({
      from_currency: fromCurrency,
      to_currency: toCurrency,
      rate: rate,
    });

  if (error) throw error;
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
