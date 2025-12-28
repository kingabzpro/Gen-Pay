// Cards service for virtual debit cards
import { createClient } from '@/lib/supabase/server';

export interface Card {
  id: string;
  userId: string;
  accountId: string;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardType: 'virtual' | 'physical';
  status: 'active' | 'inactive' | 'frozen' | 'blocked';
  dailyLimit?: number;
  monthlyLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCardData {
  accountId: string;
  cardHolderName: string;
  cardType?: 'virtual' | 'physical';
  dailyLimit?: number;
  monthlyLimit?: number;
}

function generateCardNumber(): string {
  // Generate a 16-digit card number (Luhn algorithm compliant format)
  let cardNumber = '';
  for (let i = 0; i < 16; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  return cardNumber;
}

function generateCVV(): string {
  return Math.floor(Math.random() * 900 + 100).toString();
}

function getExpiryDate(): { month: number; year: number } {
  const now = new Date();
  const year = now.getFullYear() + 3; // Cards valid for 3 years
  const month = Math.floor(Math.random() * 12) + 1;
  return { month, year };
}

export async function getCardsByUserId(userId: string): Promise<Card[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((card: any) => ({
    id: card.id,
    userId: card.user_id,
    accountId: card.account_id,
    cardNumber: card.card_number,
    cardHolderName: card.card_holder_name,
    expiryMonth: card.expiry_month,
    expiryYear: card.expiry_year,
    cvv: card.cvv,
    cardType: card.card_type,
    status: card.status,
    dailyLimit: card.daily_limit ? parseFloat(card.daily_limit) : undefined,
    monthlyLimit: card.monthly_limit ? parseFloat(card.monthly_limit) : undefined,
    createdAt: new Date(card.created_at),
    updatedAt: new Date(card.updated_at),
  }));
}

export async function getCardById(cardId: string): Promise<Card | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    accountId: data.account_id,
    cardNumber: data.card_number,
    cardHolderName: data.card_holder_name,
    expiryMonth: data.expiry_month,
    expiryYear: data.expiry_year,
    cvv: data.cvv,
    cardType: data.card_type,
    status: data.status,
    dailyLimit: data.daily_limit ? parseFloat(data.daily_limit) : undefined,
    monthlyLimit: data.monthly_limit ? parseFloat(data.monthly_limit) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function createCard(userId: string, data: CreateCardData): Promise<Card> {
  const supabase = await createClient();

  const cardNumber = generateCardNumber();
  const cvv = generateCVV();
  const { month, year } = getExpiryDate();

  const { data: card, error } = await supabase
    .from('cards')
    .insert({
      user_id: userId,
      account_id: data.accountId,
      card_number: cardNumber,
      card_holder_name: data.cardHolderName,
      expiry_month: month,
      expiry_year: year,
      cvv: cvv,
      card_type: data.cardType || 'virtual',
      status: 'active',
      daily_limit: data.dailyLimit,
      monthly_limit: data.monthlyLimit,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: card.id,
    userId: card.user_id,
    accountId: card.account_id,
    cardNumber: card.card_number,
    cardHolderName: card.card_holder_name,
    expiryMonth: card.expiry_month,
    expiryYear: card.expiry_year,
    cvv: card.cvv,
    cardType: card.card_type,
    status: card.status,
    dailyLimit: card.daily_limit ? parseFloat(card.daily_limit) : undefined,
    monthlyLimit: card.monthly_limit ? parseFloat(card.monthly_limit) : undefined,
    createdAt: new Date(card.created_at),
    updatedAt: new Date(card.updated_at),
  };
}

export async function updateCard(cardId: string, data: Partial<Card>): Promise<Card> {
  const supabase = await createClient();

  const updateData: any = {};
  if (data.status) updateData.status = data.status;
  if (data.dailyLimit !== undefined) updateData.daily_limit = data.dailyLimit;
  if (data.monthlyLimit !== undefined) updateData.monthly_limit = data.monthlyLimit;

  const { data: card, error } = await supabase
    .from('cards')
    .update(updateData)
    .eq('id', cardId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: card.id,
    userId: card.user_id,
    accountId: card.account_id,
    cardNumber: card.card_number,
    cardHolderName: card.card_holder_name,
    expiryMonth: card.expiry_month,
    expiryYear: card.expiry_year,
    cvv: card.cvv,
    cardType: card.card_type,
    status: card.status,
    dailyLimit: card.daily_limit ? parseFloat(card.daily_limit) : undefined,
    monthlyLimit: card.monthly_limit ? parseFloat(card.monthly_limit) : undefined,
    createdAt: new Date(card.created_at),
    updatedAt: new Date(card.updated_at),
  };
}

export async function deleteCard(cardId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId);

  if (error) throw error;
}

export async function freezeCard(cardId: string): Promise<Card> {
  return updateCard(cardId, { status: 'frozen' });
}

export async function unfreezeCard(cardId: string): Promise<Card> {
  return updateCard(cardId, { status: 'active' });
}

export function maskCardNumber(cardNumber: string): string {
  return '**** **** **** ' + cardNumber.slice(-4);
}
