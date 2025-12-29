import { createClient } from '@/lib/supabase/server';
import { getTransferById, cancelTransfer, updateTransferStatus } from '@/lib/services/transfers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transfer = await getTransferById(id);

    if (!transfer) {
      return Response.json({ error: 'Transfer not found' }, { status: 404 });
    }

    if (transfer.userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    return Response.json({ transfer });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transfer = await getTransferById(id);

    if (!transfer) {
      return Response.json({ error: 'Transfer not found' }, { status: 404 });
    }

    if (transfer.userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await cancelTransfer(id);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
