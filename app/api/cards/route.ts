import { createClient } from '@/lib/supabase/server';
import { getCardsByUserId, createCard } from '@/lib/services/cards';
import { z } from 'zod';

const createCardSchema = z.object({
  accountId: z.string().uuid(),
  cardHolderName: z.string().min(2),
  cardType: z.enum(['virtual', 'physical']).optional(),
  dailyLimit: z.number().positive().optional(),
  monthlyLimit: z.number().positive().optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cards = await getCardsByUserId(user.id);
    const maskedCards = cards.map(card => ({
      ...card,
      cardNumber: '**** **** **** ' + card.cardNumber.slice(-4),
      cvv: '***',
    }));
    return Response.json({ cards: maskedCards });
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
    const validatedData = createCardSchema.parse(body);

    const card = await createCard(user.id, validatedData);
    return Response.json({ card }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
