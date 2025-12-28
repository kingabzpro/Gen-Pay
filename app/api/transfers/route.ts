import { createClient } from '@/lib/supabase/server';
import { getTransfersByUserId, createTransfer, cancelTransfer } from '@/lib/services/transfers';
import { z } from 'zod';

const createTransferSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid().optional(),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().optional(),
  recipientIban: z.string().optional(),
  recipientBic: z.string().optional(),
  amount: z.number().positive(),
  fromCurrency: z.enum(['USD', 'EUR', 'GBP']),
  toCurrency: z.enum(['USD', 'EUR', 'GBP']),
  reference: z.string().optional(),
  transferType: z.enum(['internal', 'external', 'card_payment']),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transfers = await getTransfersByUserId(user.id);
    return Response.json({ transfers });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTransferSchema.parse(body);

    const transfer = await createTransfer(user.id, validatedData);
    return Response.json({ transfer }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
