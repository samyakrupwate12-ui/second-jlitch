'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DbProduct,
  ProductStatus,
  ProductType,
  PRODUCT_STATUS_LABELS,
} from '@/types/db';
import {
  createProduct,
  updateProduct,
  generateSlug,
  normalizeProductStatus,
  normalizeProductType,
  ProductFormData,
  ProductImageItem,
} from '@/lib/products-db';
import ImageUploader from './ImageUploader';
import {
  Save,
  CheckCircle,
  Archive,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Star,
} from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialProduct?: DbProduct | null;
  isEdit?: boolean;
}

export default function ProductForm({ initialProduct, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Field State
  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [autoSlugEnabled, setAutoSlugEnabled] = useState(!isEdit);
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [category, setCategory] = useState(initialProduct?.category || 'Tops');
  const [productType, setProductType] = useState<ProductType>(
    normalizeProductType(initialProduct?.product_type)
  );
  const [brand, setBrand] = useState(initialProduct?.brand || 'Second JLITCH');
  const [size, setSize] = useState(initialProduct?.size || 'Size M');
  const [condition, setCondition] = useState(initialProduct?.condition || 'Like New');
  const [color, setColor] = useState(initialProduct?.color || 'Blue');
  const [material, setMaterial] = useState(initialProduct?.material || 'Linen Blend');
  
  const [price, setPrice] = useState<number | ''>(initialProduct?.price ?? 999);
  const [originalPrice, setOriginalPrice] = useState<number | ''>(initialProduct?.original_price ?? '');
  const [inventoryQuantity, setInventoryQuantity] = useState<number | ''>(initialProduct?.inventory_quantity ?? 1);

  const [status, setStatus] = useState<ProductStatus>(
    normalizeProductStatus(initialProduct?.status)
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(initialProduct?.is_featured ?? false);
  const [isCatalogVisible, setIsCatalogVisible] = useState<boolean>(initialProduct?.is_catalog_visible ?? true);

  // Sync state if initialProduct prop changes
  React.useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setSlug(initialProduct.slug || '');
      setDescription(initialProduct.description || '');
      setCategory(initialProduct.category || 'Tops');
      setProductType(normalizeProductType(initialProduct.product_type));
      setBrand(initialProduct.brand || 'Second JLITCH');
      setSize(initialProduct.size || 'Size M');
      setCondition(initialProduct.condition || 'Like New');
      setColor(initialProduct.color || 'Blue');
      setMaterial(initialProduct.material || 'Linen Blend');
      setPrice(initialProduct.price ?? 999);
      setOriginalPrice(initialProduct.original_price ?? '');
      setInventoryQuantity(initialProduct.inventory_quantity ?? 1);
      setStatus(normalizeProductStatus(initialProduct.status));
      setIsFeatured(initialProduct.is_featured ?? false);
      setIsCatalogVisible(initialProduct.is_catalog_visible ?? true);
      if (initialProduct.product_images) {
        setImages(
          [...initialProduct.product_images]
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((img) => ({
              id: img.id,
              image_url: img.image_url,
              sort_order: img.sort_order,
              is_primary: img.is_primary,
            }))
        );
      }
    }
  }, [initialProduct]);

  // Initial Images
  const initialImagesList: ProductImageItem[] = initialProduct?.product_images
    ? [...initialProduct.product_images]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((img) => ({
          id: img.id,
          image_url: img.image_url,
          sort_order: img.sort_order,
          is_primary: img.is_primary,
        }))
    : [];

  const [images, setImages] = useState<ProductImageItem[]>(initialImagesList);

  // Handle auto-slug on name change
  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlugEnabled) {
      setSlug(generateSlug(val));
    }
  };

  const validateForm = (): string | null => {
    if (!name.trim()) return 'Product name is required.';
    if (!slug.trim()) return 'Product slug is required.';
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) return 'Valid price is required.';
    if (inventoryQuantity === '' || isNaN(Number(inventoryQuantity)) || Number(inventoryQuantity) < 0) {
      return 'Valid inventory quantity is required.';
    }
    return null;
  };

  const handleSave = async (overrideStatus?: ProductStatus) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const validationErr = validateForm();
    if (validationErr) {
      setErrorMsg(validationErr);
      return;
    }

    const targetStatus = normalizeProductStatus(overrideStatus || status);

    const formData: ProductFormData = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      category,
      product_type: productType,
      brand: brand.trim(),
      size: size.trim(),
      condition: condition.trim(),
      color: color.trim(),
      material: material.trim(),
      price: Number(price),
      original_price: originalPrice !== '' ? Number(originalPrice) : null,
      inventory_quantity: Number(inventoryQuantity),
      status: targetStatus,
      is_featured: isFeatured,
      is_catalog_visible: isCatalogVisible,
    };

    setLoading(true);

    try {
      if (isEdit && initialProduct?.id) {
        await updateProduct(initialProduct.id, formData, images);
        setSuccessMsg('Product updated successfully!');
      } else {
        const created = await createProduct(formData, images);
        setSuccessMsg('Product created successfully!');
        router.push(`/admin/products/${created.id}`);
      }
      setStatus(targetStatus);
    } catch (err: any) {
      console.error('Save Product Error:', err);
      setErrorMsg(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              {isEdit ? 'Edit Product' : 'Create New Product'}
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              {isEdit ? `Editing #${initialProduct?.id}` : 'Fill in product specifications and upload images'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>

          {status !== 'sold' && (
            <button
              type="button"
              onClick={() => {
                setInventoryQuantity(0);
                handleSave('sold');
              }}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Mark as Sold</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSave('active')}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            <span>Publish Product</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Action Failed</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold font-sans">{successMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 font-sans border-b pb-3 border-slate-100">
              Basic Product Details
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Linen Blend Blouse"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlugEnabled(!autoSlugEnabled)}
                  className="text-[11px] text-sky-600 hover:underline font-sans"
                >
                  {autoSlugEnabled ? 'Manual Edit' : 'Auto-Generate'}
                </button>
              </div>
              <input
                type="text"
                value={slug}
                readOnly={autoSlugEnabled}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="linen-blend-blouse"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-600 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as ProductType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans bg-white"
                >
                  <option value="new">New</option>
                  <option value="pre-loved">Pre-Loved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans bg-white"
                >
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Shoes">Shoes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the fit, fabric, story, and garment notes..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
              />
            </div>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 font-sans border-b pb-3 border-slate-100">
              Pricing & Stock
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="899"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={originalPrice}
                  onChange={(e) =>
                    setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="1499"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inventory Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={inventoryQuantity}
                  onChange={(e) =>
                    setInventoryQuantity(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="1"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
                />
              </div>
            </div>
          </div>

          {/* Garment Specifications Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 font-sans border-b pb-3 border-slate-100">
              Garment Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Second JLITCH / Zara / Vintage"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Size</label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="Size M / Size 32 / One Size"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans bg-white"
                >
                  <option value="Like New">Like New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good Condition">Good Condition</option>
                  <option value="Brand New with Tags">Brand New with Tags</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Sky Blue / Off-White / Beige"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Material</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="100% Linen / Organic Cotton / Silk Blend"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
                />
              </div>
            </div>
          </div>

          {/* Product Image Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <ImageUploader images={images} onChange={setImages} disabled={loading} />
          </div>
        </div>

        {/* Sidebar Controls Column (Right 1 col) */}
        <div className="space-y-6">
          {/* Status & Visibility Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 font-sans border-b pb-3 border-slate-100">
              Publishing Controls
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(normalizeProductStatus(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Published</option>
                <option value="sold">Sold</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Catalog Visibility Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  {isCatalogVisible ? <Eye className="w-3.5 h-3.5 text-sky-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Catalogue Visibility</span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  Show on website even if stock = 0
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogVisible(!isCatalogVisible)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isCatalogVisible ? 'bg-sky-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    isCatalogVisible ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Featured Item Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                  <span>Feature on Homepage</span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  Display in &quot;THE NEW EDIT&quot; hero section
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isFeatured ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    isFeatured ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Save Action Summary Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-sans">
              Summary
            </h3>
            <div className="space-y-2 text-xs text-slate-300 font-sans">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Inventory:</span>
                <span className="font-mono font-semibold text-white">{inventoryQuantity || 0} unit(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Type:</span>
                <span className="font-semibold text-sky-300">
                  {productType === 'pre-loved' ? 'Pre-Loved' : 'New'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Status:</span>
                <span className="uppercase font-mono font-semibold text-white">
                  {PRODUCT_STATUS_LABELS[status] || status}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
