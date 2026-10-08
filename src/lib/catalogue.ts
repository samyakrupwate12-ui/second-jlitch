import type { Product } from '@/types/product';
import type { ProductStatus } from '@/types/db';
import { availableQuantity } from '@/lib/shopping';

export type CatalogueFilters = { search: string; category: string; condition: string; size: string; type: string; inStock: boolean; under999: boolean; sort: string };
export const defaultFilters: CatalogueFilters = { search: '', category: 'All', condition: 'All', size: 'All', type: 'All', inStock: false, under999: false, sort: 'newest' };

export function filterCatalogue(products: Product[], filters: CatalogueFilters): Product[] {
  const query = filters.search.trim().toLowerCase();
  const matches = products.filter(p =>
    (!query || [p.name, p.brand, p.category, p.color, p.material].some(value => value?.toLowerCase().includes(query))) &&
    (filters.category === 'All' || p.category === filters.category) &&
    (filters.condition === 'All' || p.condition === filters.condition) &&
    (filters.size === 'All' || p.size === filters.size) &&
    (filters.type === 'All' || p.productType === filters.type) &&
    (!filters.inStock || availableQuantity(p) > 0) &&
    (!filters.under999 || p.price < 999)
  );
  if (filters.sort === 'price-low') matches.sort((a, b) => a.price - b.price);
  if (filters.sort === 'price-high') matches.sort((a, b) => b.price - a.price);
  return matches;
}

export function statusAfterStockChange(status: ProductStatus, quantity: number): ProductStatus {
  if (status === 'draft' || status === 'archived') return status;
  return quantity === 0 ? 'sold' : 'active';
}

export function validateProductImage(file: Pick<File, 'type' | 'size'>): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Choose a JPG, PNG or WEBP image.';
  if (file.size <= 0 || file.size > 10 * 1024 * 1024) return 'Each image must be between 1 byte and 10 MB.';
  return null;
}
