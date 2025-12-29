import { createClient } from '@/lib/supabase/server';
import { getTransactionById } from '@/lib/services/transactions';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transaction = await getTransactionById(id);

    if (!transaction) {
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    return Response.json({ transaction });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
