import { createClient } from '@/lib/supabase/server';
import { getCardById, updateCard, deleteCard } from '@/lib/services/cards';
import { z } from 'zod';

const updateCardSchema = z.object({
  status: z.enum(['active', 'inactive', 'frozen', 'blocked']).optional(),
  dailyLimit: z.number().positive().optional(),
  monthlyLimit: z.number().positive().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const card = await getCardById(id);

    if (!card) {
      return Response.json({ error: 'Card not found' }, { status: 404 });
    }

    if (card.userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const maskedCard = {
      ...card,
      cardNumber: '**** **** **** ' + card.cardNumber.slice(-4),
      cvv: '***',
    };
    return Response.json({ card: maskedCard });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const card = await getCardById(id);

    if (!card) {
      return Response.json({ error: 'Card not found' }, { status: 404 });
    }

    if (card.userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateCardSchema.parse(body);

    const updatedCard = await updateCard(id, validatedData);
    const maskedCard = {
      ...updatedCard,
      cardNumber: '**** **** **** ' + updatedCard.cardNumber.slice(-4),
      cvv: '***',
    };
    return Response.json({ card: maskedCard });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
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

    const card = await getCardById(id);

    if (!card) {
      return Response.json({ error: 'Card not found' }, { status: 404 });
    }

    if (card.userId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteCard(id);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
