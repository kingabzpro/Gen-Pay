import { createClient } from '@/lib/supabase/server';
import { getTransactionsByUserId, getTransactionsByAccount, getTransactionsByCard } from '@/lib/services/transactions';
import { z } from 'zod';

const filterSchema = z.object({
  accountId: z.string().uuid().optional(),
  cardId: z.string().uuid().optional(),
  limit: z.number().positive().max(100).optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const validatedData = filterSchema.parse({
      accountId: searchParams.get('accountId') || undefined,
      cardId: searchParams.get('cardId') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    });

    let transactions;

    if (validatedData.accountId) {
      transactions = await getTransactionsByAccount(validatedData.accountId);
    } else if (validatedData.cardId) {
      transactions = await getTransactionsByCard(validatedData.cardId);
    } else {
      transactions = await getTransactionsByUserId(user.id);
    }

    const filteredTransactions = validatedData.limit 
      ? transactions.slice(0, validatedData.limit)
      : transactions;

    return Response.json({
      transactions: filteredTransactions,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
