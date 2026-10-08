import { CheckoutError, parseAddress, parseCheckoutItems, uuidPattern } from '@/lib/checkout';
import { checkoutUser, requestBody, currentQuote, checkoutResponse, checkoutFailure, orderDatabase, requirePaymentConfig, requestFingerprint, razorpayRequest } from '@/lib/checkout-server';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { client, user } = await checkoutUser(request);
    const config = requirePaymentConfig();
    const body = await requestBody(request);
    const items = parseCheckoutItems(body.items);
    const address = parseAddress(body.address);
    if (typeof body.requestId !== 'string' || !uuidPattern.test(body.requestId) || !Number.isSafeInteger(body.expectedTotalPaise)) throw new CheckoutError('Review your order total before paying.');
    const requestHash = requestFingerprint({ items, address, expectedTotalPaise: body.expectedTotalPaise });
    const db = orderDatabase();
    const responseFor = (order: {id:string;request_hash:string;status:string;razorpay_order_id:string|null;razorpay_key_id:string;total_paise:number}) => {
      if (order.request_hash !== requestHash) throw new CheckoutError('Your bag or address changed. Review it again before paying.', 409);
      if (order.razorpay_key_id !== config.keyId) throw new CheckoutError('Payment configuration changed. Please contact the store.', 409);
      if (!order.razorpay_order_id) throw new CheckoutError('This checkout is still being set up. Check its status before starting another payment.', 409);
      return checkoutResponse({ id:order.id, status:order.status, razorpayOrderId:order.razorpay_order_id, keyId:config.keyId, totalPaise:order.total_paise, currency:'INR', mode:'test' });
    };
    const { data: existing, error: existingError } = await db.from('checkout_orders').select('*').eq('user_id', user.id).eq('request_id', body.requestId).maybeSingle();
    if (existingError) throw new CheckoutError('Could not check your previous checkout. Please try again.', 503);
    if (existing) return responseFor(existing);
    const quote = await currentQuote(client, items);
    if (quote.totalPaise !== body.expectedTotalPaise) throw new CheckoutError('Prices or shipping changed. Review your updated total before paying.', 409);
    const { count, error: limitError } = await db.from('checkout_orders').select('id', { count:'exact', head:true }).eq('user_id', user.id).gte('created_at', new Date(Date.now() - 600_000).toISOString());
    if (limitError) throw new CheckoutError('Could not start checkout. Please try again.', 503);
    if ((count ?? 0) >= 5) throw new CheckoutError('Please wait a few minutes before starting another checkout.', 429);
    const { data: order, error } = await db.from('checkout_orders').insert({ user_id:user.id, request_id:body.requestId, request_hash:requestHash, lines:quote.lines, shipping_address:address, subtotal_paise:quote.subtotalPaise, shipping_paise:quote.shippingPaise, total_paise:quote.totalPaise, razorpay_key_id:config.keyId }).select('*').single();
    if (error?.code === '23505') {
      const { data: duplicate } = await db.from('checkout_orders').select('*').eq('user_id', user.id).eq('request_id', body.requestId).single();
      if (duplicate) return responseFor(duplicate);
    }
    if (error || !order) throw new CheckoutError('Could not save your checkout. Please try again.', 503);
    // Only the winning insert calls Razorpay. Ambiguous failures remain 'creating'; never blindly create a second provider order.
    const provider = await razorpayRequest('orders', { amount:quote.totalPaise, currency:'INR', receipt:order.id, partial_payment:false, notes:{checkout_id:order.id,mode:'test'} });
    if (!/^order_[A-Za-z0-9]+$/.test(provider.id) || provider.amount !== quote.totalPaise || provider.currency !== 'INR') throw new CheckoutError('The payment service returned an unexpected order. Please contact the store.', 502);
    const { data: saved, error: saveError } = await db.from('checkout_orders').update({ razorpay_order_id:provider.id, status:'pending' }).eq('id', order.id).eq('user_id', user.id).eq('status','creating').select('*').single();
    if (saveError || !saved) throw new CheckoutError('Your checkout could not be confirmed. Please check its status before retrying.', 503);
    return responseFor(saved);
  } catch (error) { return checkoutFailure(error); }
}

export async function GET(request: Request) {
  try {
    const { client } = await checkoutUser(request);
    const { data, error } = await client.from('checkout_orders').select('id,status,total_paise,created_at,is_test').order('created_at',{ascending:false}).limit(10);
    if (error) throw new CheckoutError('Could not load your recent checkouts.', 503);
    return checkoutResponse({ orders:data });
  } catch (error) { return checkoutFailure(error); }
}
