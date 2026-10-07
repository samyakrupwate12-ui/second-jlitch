import { ProductStatus } from './db';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  condition: string;
  size?: string;
  isNewEdit?: boolean;
  
  // Extended Supabase Product attributes
  slug?: string;
  description?: string;
  brand?: string;
  color?: string;
  material?: string;
  originalPrice?: number;
  inventoryQuantity?: number;
  status?: ProductStatus;
  isFeatured?: boolean;
  isCatalogVisible?: boolean;
  productType?: 'New' | 'Pre-Loved' | string;
  images?: string[];
}
