import { createClient } from '@/lib/supabase/server';
import { getAccountsByUserId, createAccount, closeAccount } from '@/lib/services/accounts';
import { z } from 'zod';

const createAccountSchema = z.object({
  currencyCode: z.enum(['USD', 'EUR', 'GBP']),
  accountType: z.enum(['personal', 'business']).optional(),
  isPrimary: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await getAccountsByUserId(user.id);
    return Response.json({ accounts });
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
    const validatedData = createAccountSchema.parse(body);

    const account = await createAccount(user.id, validatedData);
    return Response.json({ account }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
