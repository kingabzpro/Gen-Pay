import { createClient } from '@/lib/supabase/server';
import { getAccountById, closeAccount } from '@/lib/services/accounts';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await getAccountById(id);

    if (!account) {
      return Response.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    return Response.json({ account });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await getAccountById(id);

    if (!account) {
      return Response.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await closeAccount(id);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
