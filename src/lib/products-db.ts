import { supabase } from '@/lib/supabase';
import { DbProduct, DbProductImage, ProductStatus, ProductType, PRODUCT_STATUS_LABELS } from '@/types/db';

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
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `products/${productId}/${Date.now()}_${sanitizedFileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
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
export async function getPublicProducts(): Promise<DbProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('is_catalog_visible', true)
      .in('status', ['active', 'sold'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public products:', error);
      return [];
    }

    return (data as DbProduct[]) || [];
  } catch (err) {
    console.error('Failed to query public products:', err);
    return [];
  }
}

/**
 * Fetch Pre-Loved catalog-visible products for customer /pre-loved page
 */
export async function getPreLovedPublicProducts(): Promise<DbProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .in('product_type', ['pre-loved', 'Pre-Loved'])
      .eq('is_catalog_visible', true)
      .in('status', ['active', 'sold'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pre-loved products:', error);
      return [];
    }

    return (data as DbProduct[]) || [];
  } catch (err) {
    console.error('Failed to query pre-loved products:', err);
    return [];
  }
}

/**
 * Fetch a single product by ID or Slug
 */
export async function getProductByIdOrSlug(idOrSlug: string): Promise<DbProduct | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    let query = supabase.from('products').select('*, product_images(*)');
    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.single();
    if (error || !data) return null;

    return data as DbProduct;
  } catch (err) {
    console.error('Error fetching product by ID/Slug:', err);
    return null;
  }
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
    await syncProductImages(productId, images);
  }

  // 3. Return full product with images
  const fullProd = await getProductByIdOrSlug(productId);
  return fullProd || newProd;
}

/**
 * Update an existing product and sync its images
 */
export async function updateProduct(
  productId: string,
  formData: Partial<ProductFormData>,
  images?: ProductImageItem[]
): Promise<DbProduct> {
  const updatePayload: Record<string, any> = {
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

  const { error: updateErr } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', productId);

  if (updateErr) {
    console.error('Error updating product:', updateErr);
    if (updateErr.code === '23505') {
      throw new Error('A product with this slug already exists. Please enter a unique slug.');
    }
    throw new Error(`Failed to update product: ${updateErr.message}`);
  }

  // Sync images if provided
  if (images) {
    await syncProductImages(productId, images);
  }

  const fullProd = await getProductByIdOrSlug(productId);
  return fullProd || ({ id: productId, ...updatePayload } as DbProduct);
}

/**
 * Update ONLY the is_catalog_visible field for a product
 * DIAGNOSTIC LOGGING ACTIVE — remove after confirming fix
 */
export async function updateProductVisibility(
  productId: string,
  isCatalogVisible: boolean
): Promise<void> {
  // 1. Verify authenticated Supabase session
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('[CATALOGUE UPDATE] No authenticated user session found:', authError?.message);
    throw new Error('Not authenticated. Please log in as an administrator.');
  }

  const newVisibility = Boolean(isCatalogVisible);

  // 2. Exact payload — ONLY is_catalog_visible
  const payload = {
    is_catalog_visible: newVisibility,
  };

  // 3. Pre-update attempt log
  console.log('CATALOGUE UPDATE ATTEMPT', {
    productId,
    currentUserId: user.id,
    payload,
  });

  // 4. Supabase call — single field, no extra fields, no RETURNING clause
  const { error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', productId);

  if (error) {
    // 5. Full enumerated error log — every field captured explicitly
    console.error('CATALOGUE UPDATE ERROR', {
      productId,
      currentUserId: user.id,
      currentUserEmail: user.email,
      payload,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details,
      errorHint: error?.hint,
      errorName: (error as any)?.name,
      errorString: String(error),
      errorJson: JSON.stringify(error),
    });
    throw new Error(`Failed to update product: ${error.message}`);
  }

  console.log('CATALOGUE UPDATE SUCCESS', {
    productId,
    currentUserId: user.id,
    payload,
  });
}

/**
 * Delete a product and its images
 */
export async function deleteProduct(productId: string): Promise<void> {
  // Delete image records first
  await supabase.from('product_images').delete().eq('product_id', productId);
  
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}

/**
 * Sync product images: upload new files, insert/update records, delete removed ones
 */
async function syncProductImages(productId: string, images: ProductImageItem[]) {
  // Get existing images from database
  const { data: existingDbImages } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId);

  const existingIds = new Set((existingDbImages || []).map((img) => img.id));
  const keepIds = new Set(images.filter((img) => img.id).map((img) => img.id));

  // Identify images to delete
  const toDelete = (existingDbImages || []).filter((img) => !keepIds.has(img.id));
  for (const imgToDelete of toDelete) {
    await supabase.from('product_images').delete().eq('id', imgToDelete.id);
  }

  // Upload new files and prepare rows for insert/update
  for (let idx = 0; idx < images.length; idx++) {
    const img = images[idx];
    let finalUrl = img.image_url;

    if (img.file) {
      finalUrl = await uploadImageToStorage(img.file, productId);
    }

    if (img.id && existingIds.has(img.id)) {
      // Update existing record
      await supabase
        .from('product_images')
        .update({
          image_url: finalUrl,
          sort_order: idx,
          is_primary: img.is_primary,
        })
        .eq('id', img.id);
    } else {
      // Insert new record
      await supabase.from('product_images').insert({
        product_id: productId,
        image_url: finalUrl,
        sort_order: idx,
        is_primary: img.is_primary,
      });
    }
  }
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
