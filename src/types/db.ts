export type ProductStatus = 'draft' | 'active' | 'archived' | 'sold';
export type ProductType = 'new' | 'pre-loved';

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Draft',
  active: 'Published',
  sold: 'Sold',
  archived: 'Archived',
};

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  product_type: ProductType;
  brand: string | null;
  size: string | null;
  condition: string | null;
  color: string | null;
  material: string | null;
  price: number;
  original_price: number | null;
  inventory_quantity: number;
  status: ProductStatus;
  is_featured: boolean;
  is_catalog_visible: boolean;
  created_at?: string;
  updated_at?: string;
  product_images?: DbProductImage[];
}

export interface DbProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
  created_at?: string;
}

export interface AdminUser {
  user_id: string;
  created_at: string;
}
