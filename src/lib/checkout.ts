export class CheckoutError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export type CheckoutItem = { product_id: string; quantity: number };
export type ShippingAddress = { name: string; phone: string; line1: string; line2: string; city: string; state: string; pincode: string; country: 'IN' };
export type QuoteLine = CheckoutItem & { name: string; size: string | null; unitPaise: number; linePaise: number };
export type CheckoutQuote = { lines: QuoteLine[]; subtotalPaise: number; shippingPaise: number | null; totalPaise: number | null; currency: 'INR' };
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseCheckoutItems(value: unknown): CheckoutItem[] {
  if (!Array.isArray(value) || !value.length || value.length > 20) throw new CheckoutError('Your bag must contain between 1 and 20 different pieces.');
  const ids = new Set<string>();
  return value.map(item => {
    if (!item || typeof item.product_id !== 'string' || !uuidPattern.test(item.product_id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new CheckoutError('Your bag contains an invalid item or quantity.');
    const id = item.product_id.toLowerCase();
    if (ids.has(id)) throw new CheckoutError('Your bag contains duplicate items.');
    ids.add(id);
    return { product_id: id, quantity: item.quantity };
  }).sort((a, b) => a.product_id.localeCompare(b.product_id));
}

export function parseAddress(value: unknown): ShippingAddress {
  if (!value || typeof value !== 'object') throw new CheckoutError('Enter your delivery address.');
  const data = value as Record<string, unknown>;
  const field = (key: string, min: number, max: number) => {
    const text = typeof data[key] === 'string' ? data[key].trim() : '';
    if (text.length < min || text.length > max || /[\u0000-\u001f]/.test(text)) throw new CheckoutError(`Please enter a valid ${key}.`);
    return text;
  };
  const phone = field('phone', 10, 16).replace(/[\s()-]/g, '').replace(/^\+91/, '');
  const pincode = field('pincode', 6, 6);
  if (!/^[6-9][0-9]{9}$/.test(phone)) throw new CheckoutError('Enter a valid 10-digit Indian mobile number.');
  if (!/^[1-9][0-9]{5}$/.test(pincode)) throw new CheckoutError('Enter a valid 6-digit PIN code.');
  if (data.country && data.country !== 'IN') throw new CheckoutError('Delivery is currently available within India.');
  return { name: field('name', 2, 100), phone, line1: field('line1', 5, 200), line2: field('line2', 0, 200), city: field('city', 2, 100), state: field('state', 2, 100), pincode, country: 'IN' };
}

export function toPaise(value: string | number): number {
  const text = String(value);
  if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new CheckoutError('A product price is unavailable. Please contact the store.', 409);
  const [whole, fraction = ''] = text.split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(result) || result < 0 || result > 50_000_000) throw new CheckoutError('A product price is unavailable.', 409);
  return result;
}

export function quoteProducts(items: CheckoutItem[], products: { id: string; name: string; size: string | null; price: string | number; status: string; is_catalog_visible: boolean; inventory_quantity: number }[], shippingPaise: number | null): CheckoutQuote {
  const lines = items.map(item => {
    const product = products.find(p => p.id === item.product_id);
    if (!product || !product.is_catalog_visible || product.status !== 'active' || product.inventory_quantity < item.quantity) throw new CheckoutError('A piece is no longer available in the requested quantity. Please update your bag.', 409);
    const unitPaise = toPaise(product.price);
    return { ...item, name: product.name, size: product.size, unitPaise, linePaise: unitPaise * item.quantity };
  });
  const subtotalPaise = lines.reduce((sum, item) => sum + item.linePaise, 0);
  const totalPaise = shippingPaise === null ? null : subtotalPaise + shippingPaise;
  if (subtotalPaise < 100 || (totalPaise ?? subtotalPaise) > 50_000_000) throw new CheckoutError('This order total is outside the supported range.');
  return { lines, subtotalPaise, shippingPaise, totalPaise, currency: 'INR' };
}
export const formatINR = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
