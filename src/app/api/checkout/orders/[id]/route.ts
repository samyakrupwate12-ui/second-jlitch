import { CheckoutError, uuidPattern } from '@/lib/checkout';
import { checkoutUser, checkoutResponse, checkoutFailure } from '@/lib/checkout-server';
export const runtime = 'nodejs';
export async function GET(request: Request, context: {params:Promise<{id:string}>}) {
  try {
    const { client } = await checkoutUser(request);
    const { id } = await context.params;
    if (!uuidPattern.test(id)) throw new CheckoutError('Checkout not found.',404);
    const { data, error } = await client.from('checkout_orders').select('id,status,lines,subtotal_paise,shipping_paise,total_paise,currency,is_test,created_at').eq('id',id).maybeSingle();
    if (error) throw new CheckoutError('Could not load this checkout.',503);
    if (!data) throw new CheckoutError('Checkout not found.',404);
    return checkoutResponse(data);
  } catch(error) { return checkoutFailure(error); }
}
