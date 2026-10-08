import { parseCheckoutItems } from '@/lib/checkout';
import { checkoutUser, requestBody, currentQuote, checkoutResponse, checkoutFailure } from '@/lib/checkout-server';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const { client } = await checkoutUser(request);
    const body = await requestBody(request);
    return checkoutResponse(await currentQuote(client, parseCheckoutItems(body.items)));
  } catch (error) { return checkoutFailure(error); }
}
