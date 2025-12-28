import { convertCurrency } from '@/lib/services/exchange-rates';
import { z } from 'zod';

const convertSchema = z.object({
  amount: z.number().positive(),
  fromCurrency: z.enum(['USD', 'EUR', 'GBP']),
  toCurrency: z.enum(['USD', 'EUR', 'GBP']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = convertSchema.parse(body);

    const convertedAmount = await convertCurrency(
      validatedData.amount,
      validatedData.fromCurrency,
      validatedData.toCurrency
    );

    return Response.json({
      from: validatedData.amount,
      fromCurrency: validatedData.fromCurrency,
      to: convertedAmount,
      toCurrency: validatedData.toCurrency,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
