import { CheckoutError, uuidPattern } from '@/lib/checkout';
import { checkoutUser, requestBody, checkoutResponse, checkoutFailure, orderDatabase, requirePaymentConfig, validPaymentSignature, razorpayRequest } from '@/lib/checkout-server';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const { user } = await checkoutUser(request);
    const config = requirePaymentConfig();
    const body = await requestBody(request);
    if (typeof body.id !== 'string' || !uuidPattern.test(body.id)) throw new CheckoutError('Checkout not found.',404);
    const db = orderDatabase();
    const { data: order, error } = await db.from('checkout_orders').select('*').eq('id',body.id).eq('user_id',user.id).maybeSingle();
    if (error) throw new CheckoutError('Could not check this payment.',503);
    if (!order) throw new CheckoutError('Checkout not found.',404);
    if (!order.razorpay_order_id) return checkoutResponse({id:order.id,status:'creating'});
    if (!order.is_test || order.razorpay_key_id !== config.keyId) throw new CheckoutError('This payment cannot be checked with the current configuration.',409);
    const callback = body.razorpay_payment_id !== undefined || body.razorpay_signature !== undefined || body.razorpay_order_id !== undefined;
    if (callback && (typeof body.razorpay_payment_id !== 'string' || !/^pay_[A-Za-z0-9]+$/.test(body.razorpay_payment_id) || typeof body.razorpay_signature !== 'string' || body.razorpay_order_id !== order.razorpay_order_id || !validPaymentSignature(order.razorpay_order_id,body.razorpay_payment_id,body.razorpay_signature,config.secret))) throw new CheckoutError('Payment confirmation could not be verified.',400);
    if (order.status === 'paid') return checkoutResponse({id:order.id,status:'paid'});
    const providerOrder = await razorpayRequest(`orders/${order.razorpay_order_id}`);
    const payment = callback ? await razorpayRequest(`payments/${body.razorpay_payment_id}`) :
      (await razorpayRequest(`orders/${order.razorpay_order_id}/payments`)).items?.find((p:{status:string})=>p.status==='captured');
    if (!payment || payment.status !== 'captured' || providerOrder.status !== 'paid') return checkoutResponse({id:order.id,status:'pending'});
    if (payment.order_id !== order.razorpay_order_id || payment.amount !== order.total_paise || payment.currency !== 'INR' || payment.captured !== true || payment.amount_refunded !== 0 || providerOrder.id !== order.razorpay_order_id || providerOrder.amount !== order.total_paise || providerOrder.currency !== 'INR' || providerOrder.amount_paid !== order.total_paise) throw new CheckoutError('The payment does not match this checkout. Please contact the store.',409);
    const { data: saved, error: saveError } = await db.from('checkout_orders').update({status:'paid',razorpay_payment_id:payment.id,paid_at:new Date().toISOString()}).eq('id',order.id).eq('user_id',user.id).eq('status','pending').select('id').maybeSingle();
    if (saveError) throw new CheckoutError('Payment was received but confirmation could not be saved. Check status again.',503);
    if (!saved) {
      const { data: latest } = await db.from('checkout_orders').select('status').eq('id',order.id).eq('user_id',user.id).single();
      if (latest?.status !== 'paid') throw new CheckoutError('Payment confirmation is still processing. Check status again.',409);
    }
    // Test checkouts intentionally leave real stock and shopping bags unchanged.
    return checkoutResponse({id:order.id,status:'paid'});
  } catch(error) { return checkoutFailure(error); }
}
