import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { CheckoutError, quoteProducts, type CheckoutItem } from '@/lib/checkout';

export function paymentConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const databaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const fee = process.env.CHECKOUT_SHIPPING_PAISE;
  const shippingPaise = fee !== undefined && /^\d+$/.test(fee) && Number(fee) <= 100_000 ? Number(fee) : null;
  // Phase 5 cannot collect real money: reservations and webhooks belong to Phase 6.
  const enabled = process.env.ENABLE_TEST_CHECKOUT === 'true' && /^rzp_test_[A-Za-z0-9]+$/.test(keyId) && !!secret && !!databaseKey && shippingPaise !== null;
  return { keyId, secret, databaseKey, shippingPaise, enabled };
}
export function requirePaymentConfig() {
  const config = paymentConfig();
  if (!config.enabled) throw new CheckoutError('Payments are not available yet. Please check back soon.', 503);
  return config;
}
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
export async function checkoutUser(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) throw new CheckoutError('Sign in to continue to checkout.', 401);
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { ...options, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new CheckoutError('Your session has expired. Please sign in again.', 401);
  return { client, user: data.user };
}
export function orderDatabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, requirePaymentConfig().databaseKey, options);
}
export async function requestBody(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > 16384) throw new CheckoutError('Request is too large.', 413);
  const text = await request.text();
  if (text.length > 16384) throw new CheckoutError('Request is too large.', 413);
  try { const value = JSON.parse(text); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value as Record<string, unknown>; }
  catch { throw new CheckoutError('Invalid checkout request.'); }
}
export async function currentQuote(client: Awaited<ReturnType<typeof checkoutUser>>['client'], items: CheckoutItem[]) {
  const { data, error } = await client.from('products').select('id,name,size,price,status,is_catalog_visible,inventory_quantity').in('id', items.map(i => i.product_id));
  if (error) throw new CheckoutError('Could not check current prices. Please try again.', 503);
  return quoteProducts(items, data || [], paymentConfig().shippingPaise);
}
export function requestFingerprint(value: unknown) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
export function validPaymentSignature(orderId: string, paymentId: string, signature: string, secret: string) {
  if (!/^[0-9a-f]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
export async function razorpayRequest(path: string, body?: unknown) {
  const { keyId, secret } = requirePaymentConfig();
  try {
    const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
      method: body ? 'POST' : 'GET', cache: 'no-store', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString('base64')}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error('Provider error');
    return await response.json();
  } catch { throw new CheckoutError('The payment service could not respond. Check this order’s status before starting another payment.', 502); }
}
export function checkoutResponse(value: unknown, status = 200) { return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } }); }
export function checkoutFailure(error: unknown) {
  return checkoutResponse({ error: error instanceof CheckoutError ? error.message : 'Checkout could not be completed. Please try again.' }, error instanceof CheckoutError ? error.status : 500);
}
