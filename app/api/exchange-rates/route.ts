import { getAllExchangeRates, convertCurrency } from '@/lib/services/exchange-rates';

export async function GET(request: Request) {
  try {
    const rates = await getAllExchangeRates();
    return Response.json({ rates });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
