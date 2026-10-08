import { paymentConfig, checkoutResponse } from '@/lib/checkout-server';
export const runtime = 'nodejs';
export async function GET() {
  const { enabled, shippingPaise } = paymentConfig();
  return checkoutResponse({ enabled, shippingPaise, mode: 'test' });
}
