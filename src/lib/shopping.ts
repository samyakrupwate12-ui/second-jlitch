import type { Product } from '@/types/product';

export type SavedKind = 'cart' | 'wishlist';
export interface SavedItem { product_id: string; kind: SavedKind; quantity: number }
export const GUEST_KEY = 'second-jlitch:guest:v1';

export function availableQuantity(product?: Product | null): number {
  if (!product || product.status !== 'active' || !product.isCatalogVisible) return 0;
  return Math.max(0, Math.floor(product.inventoryQuantity ?? 0));
}

export function parseSavedItems(value: string | null): SavedItem[] {
  try {
    const raw: unknown = JSON.parse(value || '[]');
    if (!Array.isArray(raw)) return [];
    const items = new Map<string, SavedItem>();
    for (const row of raw.slice(0, 200)) {
      if (!row || typeof row !== 'object') continue;
      const { product_id, kind, quantity } = row;
      if (typeof product_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product_id)) continue;
      if (kind !== 'cart' && kind !== 'wishlist') continue;
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) continue;
      items.set(`${kind}:${product_id}`, { product_id, kind, quantity: kind === 'wishlist' ? 1 : quantity });
    }
    return [...items.values()];
  } catch { return []; }
}
