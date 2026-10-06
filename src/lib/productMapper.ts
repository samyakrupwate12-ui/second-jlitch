import { Product } from '@/types/product';
import { DbProduct, DbProductImage } from '@/types/db';

export function mapDbProductToProduct(dbProd: DbProduct): Product {
  // Sort images by sort_order ascending
  const sortedImages = dbProd.product_images
    ? [...dbProd.product_images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    : [];

  // Find primary image or fall back to first image or placeholder image
  const primaryImg = sortedImages.find((img) => img.is_primary)?.image_url 
    || sortedImages[0]?.image_url 
    || '/images/products/linen-blend-blouse.jpg';

  const allImages = sortedImages.length > 0
    ? sortedImages.map((img) => img.image_url)
    : [primaryImg];

  return {
    id: dbProd.id,
    name: dbProd.name,
    price: Number(dbProd.price) || 0,
    image: primaryImg,
    category: dbProd.category || 'Tops',
    condition: dbProd.condition || 'Like New',
    size: dbProd.size || undefined,
    isNewEdit: dbProd.product_type?.toLowerCase() === 'new' || dbProd.is_featured,
    
    // Additional properties
    slug: dbProd.slug,
    description: dbProd.description || undefined,
    brand: dbProd.brand || undefined,
    color: dbProd.color || undefined,
    material: dbProd.material || undefined,
    originalPrice: dbProd.original_price ? Number(dbProd.original_price) : undefined,
    inventoryQuantity: dbProd.inventory_quantity ?? 0,
    status: dbProd.status,
    isFeatured: dbProd.is_featured,
    isCatalogVisible: dbProd.is_catalog_visible,
    productType: dbProd.product_type?.toLowerCase() === 'pre-loved' ? 'Pre-Loved' : 'New',
    images: allImages,
  };
}
