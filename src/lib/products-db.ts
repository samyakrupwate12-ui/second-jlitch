import { validateProductImage } from '@/lib/catalogue';
import { supabase } from '@/lib/supabase';
import { DbProduct, ProductStatus, ProductType, PRODUCT_STATUS_LABELS } from '@/types/db';

export { PRODUCT_STATUS_LABELS };

/**
 * Ensures status sent to Supabase is strictly one of 'draft' | 'active' | 'sold' | 'archived'
 */
export function normalizeProductStatus(status?: string | null): ProductStatus {
  if (!status) return 'draft';
  const s = status.trim().toLowerCase();
  if (s === 'active' || s === 'published' || s === 'publish') return 'active';
  if (s === 'sold') return 'sold';
  if (s === 'archived') return 'archived';
  return 'draft';
}

/**
 * Ensures product_type sent to Supabase is strictly one of 'new' | 'pre-loved'
 */
export function normalizeProductType(type?: string | null): ProductType {
  if (!type) return 'new';
  const t = type.trim().toLowerCase();
  if (t === 'pre-loved' || t === 'preloved') return 'pre-loved';
  return 'new';
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  product_type: ProductType;
  brand: string;
  size: string;
  condition: string;
  color: string;
  material: string;
  price: number;
  original_price: number | null;
  inventory_quantity: number;
  status: ProductStatus;
  is_featured: boolean;
  is_catalog_visible: boolean;
}

export interface ProductImageItem {
  id?: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
  file?: File;
  isNew?: boolean;
}

/**
 * Upload an image file to Supabase Storage bucket `product-images`
 */
export async function uploadImageToStorage(file: File, productId: string): Promise<string> {
  const validationError = validateProductImage(file);
  if (validationError) throw new Error(validationError);
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `products/${productId}/${crypto.randomUUID()}_${sanitizedFileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image to storage:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Fetch all catalog-visible products for public customer view
 */
export async function getPublicProducts(preLovedOnly = false): Promise<DbProduct[]> {
  let query = supabase.from('products').select('*, product_images(*)')
    .eq('is_catalog_visible', true).in('status', ['active', 'sold']);
  if (preLovedOnly) query = query.eq('product_type', 'pre-loved');
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error('Unable to load the collection. Please try again.');
  return (data as DbProduct[]) || [];
}

export async function getPreLovedPublicProducts(): Promise<DbProduct[]> {
  return getPublicProducts(true);
}

/** Admin callers also use this lookup; RLS limits customers to published pieces. */
export async function getProductByIdOrSlug(idOrSlug: string): Promise<DbProduct | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const { data, error } = await supabase.from('products').select('*, product_images(*)')
    .eq(isUuid ? 'id' : 'slug', idOrSlug).maybeSingle();
  if (error) throw new Error('Unable to load this product. Please try again.');
  return data as DbProduct | null;
}

export class ProductSaveError extends Error {
  constructor(public productId: string, cause: unknown) {
    super(`Product details were saved, but saving or refreshing the gallery did not finish. ${cause instanceof Error ? cause.message : 'Please try again.'}`);
    this.name = 'ProductSaveError';
  }
}

function validateProductData(data: Partial<ProductFormData>) {
  if (data.price !== undefined && (!Number.isFinite(data.price) || data.price < 0)) throw new Error('Enter a valid non-negative price.');
  if (data.original_price != null && (!Number.isFinite(data.original_price) || data.original_price < 0)) throw new Error('Enter a valid original price.');
  if (data.inventory_quantity !== undefined && (!Number.isInteger(data.inventory_quantity) || data.inventory_quantity < 0)) throw new Error('Stock must be a non-negative whole number.');
  if (data.slug !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug.trim())) throw new Error('Use lowercase letters, numbers and single hyphens for the slug.');
}

/**
 * Fetch all products for Admin management
 */
export async function getAllProductsAdmin(filters?: {
  status?: string;
  product_type?: string;
  search?: string;
}): Promise<DbProduct[]> {
  let query = supabase
    .from('products')
    .select('*, product_images(*)')
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'All') {
    query = query.eq('status', filters.status);
  }

  if (filters?.product_type && filters.product_type !== 'All') {
    const pType = filters.product_type.toLowerCase() === 'pre-loved' ? 'pre-loved' : 'new';
    query = query.eq('product_type', pType);
  }

  if (filters?.search && filters.search.trim()) {
    const s = filters.search.trim().toLowerCase();
    query = query.or(`name.ilike.%${s}%,slug.ilike.%${s}%,brand.ilike.%${s}%,category.ilike.%${s}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching admin products:', error);
    throw new Error(error.message);
  }

  return (data as DbProduct[]) || [];
}

/**
 * Create a new product with images
 */
export async function createProduct(
  formData: ProductFormData,
  images: ProductImageItem[]
): Promise<DbProduct> {
  validateProductData(formData);
  const normalizedStatus = normalizeProductStatus(formData.status);
  const normalizedType = normalizeProductType(formData.product_type);

  // 1. Insert product record
  const { data: newProd, error: prodErr } = await supabase
    .from('products')
    .insert([
      {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description?.trim() || null,
        category: formData.category,
        product_type: normalizedType,
        brand: formData.brand?.trim() || null,
        size: formData.size?.trim() || null,
        condition: formData.condition?.trim() || null,
        color: formData.color?.trim() || null,
        material: formData.material?.trim() || null,
        price: formData.price,
        original_price: formData.original_price,
        inventory_quantity: formData.inventory_quantity,
        status: normalizedStatus,
        is_featured: formData.is_featured,
        is_catalog_visible: formData.is_catalog_visible,
      },
    ])
    .select()
    .single();

  if (prodErr || !newProd) {
    console.error('Error creating product:', prodErr);
    if (prodErr?.code === '23505') {
      throw new Error('A product with this slug already exists. Please enter a unique slug.');
    }
    throw new Error(`Failed to create product: ${prodErr?.message || 'Unknown error'}`);
  }

  const productId = newProd.id;

  // 2. Upload and insert product images
  if (images && images.length > 0) {
    try { await syncProductImages(productId, images); }
    catch (error) { throw new ProductSaveError(productId, error); }
  }

  // 3. Return full product with images
  try {
    const fullProd = await getProductByIdOrSlug(productId);
    if (!fullProd) throw new Error('Reload the product to check its saved state.');
    return fullProd;
  } catch (error) { throw new ProductSaveError(productId, error); }
}

/**
 * Update an existing product and sync its images
 */
export async function updateProduct(
  productId: string,
  formData: Partial<ProductFormData>,
  images?: ProductImageItem[]
): Promise<DbProduct> {
  validateProductData(formData);
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (formData.name !== undefined) updatePayload.name = formData.name.trim();
  if (formData.slug !== undefined) updatePayload.slug = formData.slug.trim();
  if (formData.description !== undefined) updatePayload.description = formData.description?.trim() || null;
  if (formData.category !== undefined) updatePayload.category = formData.category;
  if (formData.product_type !== undefined) updatePayload.product_type = normalizeProductType(formData.product_type);
  if (formData.brand !== undefined) updatePayload.brand = formData.brand?.trim() || null;
  if (formData.size !== undefined) updatePayload.size = formData.size?.trim() || null;
  if (formData.condition !== undefined) updatePayload.condition = formData.condition?.trim() || null;
  if (formData.color !== undefined) updatePayload.color = formData.color?.trim() || null;
  if (formData.material !== undefined) updatePayload.material = formData.material?.trim() || null;
  if (formData.price !== undefined) updatePayload.price = formData.price;
  if (formData.original_price !== undefined) updatePayload.original_price = formData.original_price;
  if (formData.inventory_quantity !== undefined) updatePayload.inventory_quantity = formData.inventory_quantity;
  if (formData.status !== undefined) updatePayload.status = normalizeProductStatus(formData.status);
  if (formData.is_featured !== undefined) updatePayload.is_featured = formData.is_featured;
  if (formData.is_catalog_visible !== undefined) updatePayload.is_catalog_visible = formData.is_catalog_visible;

  const { error: updateErr, count } = await supabase
    .from('products')
    .update(updatePayload, { count: 'exact' })
    .eq('id', productId);

  if (updateErr) {
    console.error('Error updating product:', updateErr);
    if (updateErr.code === '23505') {
      throw new Error('A product with this slug already exists. Please enter a unique slug.');
    }
    throw new Error(`Failed to update product: ${updateErr.message}`);
  }

  if (count !== 1) throw new Error('Product was not updated. Refresh and check your admin session.');

  // Sync images if provided
  if (images) {
    try { await syncProductImages(productId, images); }
    catch (error) { throw new ProductSaveError(productId, error); }
  }

  try {
    const fullProd = await getProductByIdOrSlug(productId);
    if (!fullProd) throw new Error('Reload the product to check its saved state.');
    return fullProd;
  } catch (error) { throw new ProductSaveError(productId, error); }
}

/** Update visibility without changing stock or publication status. */
export async function updateProductVisibility(productId: string, isCatalogVisible: boolean): Promise<void> {
  const { error, count } = await supabase.from('products')
    .update({ is_catalog_visible: isCatalogVisible }, { count: 'exact' }).eq('id', productId);
  if (error) throw new Error(`Failed to update visibility: ${error.message}`);
  if (count !== 1) throw new Error('Visibility was not updated. Refresh and check your admin session.');
}

async function removeStoredImages(productId: string, urls: string[]) {
  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/products/${productId}/`;
  const paths = [...new Set(urls.filter(url => url.startsWith(prefix)).map(url =>
    `products/${productId}/${decodeURIComponent(url.slice(prefix.length))}`
  ))].filter(path => !path.split('/').includes('..'));
  if (!paths.length) return;
  const { error } = await supabase.storage.from('product-images').remove(paths);
  if (error) throw new Error('The changes were saved, but unused image files could not be removed from storage.');
}

export async function deleteProduct(productId: string): Promise<void> {
  const product = await getProductByIdOrSlug(productId);
  if (!product) throw new Error('Product not found. Refresh the list.');
  // Image records cascade with the product, so a denied delete cannot strip its gallery.
  const { error, count } = await supabase.from('products').delete({ count: 'exact' }).eq('id', productId);
  if (error) throw new Error(`Failed to delete product: ${error.message}`);
  if (count !== 1) throw new Error('Product was not deleted. Check your admin session.');
  await removeStoredImages(productId, (product.product_images || []).map(image => image.image_url));
}

async function syncProductImages(productId: string, images: ProductImageItem[]) {
  if (images.length > 20) throw new Error('Use at most 20 images per product.');
  for (const image of images) {
    if (image.file) {
      const error = validateProductImage(image.file);
      if (error) throw new Error(error);
    }
  }
  const rows = [];
  const uploaded: string[] = [];
  try {
    for (const image of images) {
      const url = image.file ? await uploadImageToStorage(image.file, productId) : image.image_url;
      if (image.file) uploaded.push(url);
      rows.push({ id: image.id || crypto.randomUUID(), image_url: url, is_primary: image.is_primary });
    }
  } catch (error) {
    // No database save has been attempted yet, so these files are safe to clean up.
    await removeStoredImages(productId, uploaded).catch(() => undefined);
    throw error;
  }
  const { data, error } = await supabase.rpc('save_product_images', { p_product_id: productId, p_images: rows });
  // A lost response may mean the transaction committed: do not delete uploads here.
  if (error) throw new Error(`Image save failed: ${error.message}. Reload this product before retrying.`);
  await removeStoredImages(productId, (data || []) as string[]);
}

/**
 * Generate a clean URL slug from string
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
