'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductByIdOrSlug } from '@/lib/products-db';
import { mapDbProductToProduct } from '@/lib/productMapper';
import { useShop } from '@/context/ShopContext';
import { availableQuantity } from '@/lib/shopping';
import { Product } from '@/types/product';
import SkyBackground from '@/components/ui/SkyBackground';
import { ArrowLeft, ShoppingBag, Heart, ShieldCheck, Sparkles, Check, Loader2 } from 'lucide-react';

export default function SingleProductPage() {
  const params = useParams();
  const idOrSlug = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const { items, save, ready, busy } = useShop();
  const isWishlisted = items.some(i => i.kind === 'wishlist' && i.product_id === product?.id);
  const cartQuantity = items.find(i => i.kind === 'cart' && i.product_id === product?.id)?.quantity ?? 0;
  const addedToCart = cartQuantity > 0;

  useEffect(() => {
    if (!idOrSlug) return;
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        setError('');
        setProduct(null);
        // Try fetching from Supabase
        const dbProd = await getProductByIdOrSlug(idOrSlug);
        if (!active) return;
        if (dbProd && dbProd.is_catalog_visible && ['active', 'sold'].includes(dbProd.status)) {
          const mapped = mapDbProductToProduct(dbProd);
          setProduct(mapped);
          setSelectedImage(mapped.image);
        } else { setProduct(null); }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load product.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadData();
    const refresh = () => setAttempt(value => value + 1);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [idOrSlug, attempt]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) return <div role="alert" className="text-center py-20"><p>{error}</p><button className="mt-4 text-sky-700 underline" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>;

  if (!product) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-2xl font-serif text-slate-900">Garment Not Found</h1>
        <p className="text-xs text-slate-500 mt-2 font-sans">
          The requested piece could not be located in our catalogue.
        </p>
        <Link
          href="/products"
          className="mt-6 px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-widest hover:bg-sky-600 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const isSoldOut = availableQuantity(product) === 0;
  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="flex-grow flex flex-col pb-16">
      {/* Sky Header Banner */}
      <div className="relative py-6 px-4 sm:px-6 lg:px-8 overflow-hidden sky-hero-gradient border-b border-sky-100">
        <SkyBackground />
        <div className="max-w-7xl mx-auto relative z-10 flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </Link>
          <span className="text-[11px] font-sans tracking-widest uppercase text-slate-500">
            {product.productType || 'Curated Edit'}
          </span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 sm:pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-lg shadow-sky-100/40">
              <Image
                src={selectedImage || product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover object-center ${isSoldOut ? 'opacity-90 grayscale-[20%]' : ''}`}
              />

              {isSoldOut && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-md">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {imagesList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    aria-label={`View image ${idx + 1}`}
                    aria-pressed={selectedImage === imgUrl}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === imgUrl ? 'border-sky-500 scale-105 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={imgUrl} alt={`Thumbnail ${idx + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Specifications & Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                  {product.category}
                </span>
                {product.condition && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {product.condition}
                  </span>
                )}
                {product.productType === 'Pre-Loved' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Pre-Loved
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif text-slate-900 tracking-tight">
                {product.name}
              </h1>

              {product.brand && (
                <p className="text-xs font-sans text-slate-500 uppercase tracking-widest mt-1">
                  Brand: {product.brand}
                </p>
              )}
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 border-y border-slate-100 py-4">
              <span className="text-2xl sm:text-3xl font-semibold font-sans text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-sm font-sans text-slate-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Garment attributes */}
            <div className="grid grid-cols-2 gap-4 text-xs font-sans p-4 rounded-2xl bg-slate-50 border border-slate-100">
              {product.size && (
                <div>
                  <span className="text-slate-400 block font-medium">Size</span>
                  <span className="font-semibold text-slate-800">{product.size}</span>
                </div>
              )}
              {product.color && (
                <div>
                  <span className="text-slate-400 block font-medium">Color</span>
                  <span className="font-semibold text-slate-800">{product.color}</span>
                </div>
              )}
              {product.material && (
                <div>
                  <span className="text-slate-400 block font-medium">Material</span>
                  <span className="font-semibold text-slate-800">{product.material}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block font-medium">Inventory</span>
                <span className="font-semibold text-slate-800">
                  {isSoldOut ? '0 (Out of Stock)' : `${availableQuantity(product)} available`}
                </span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-sans">
                  Description & Story
                </h3>
                <p className="text-sm text-slate-600 font-sans leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 space-y-3">
              {isSoldOut ? (
                <div className="w-full py-4 rounded-full bg-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-widest text-center cursor-not-allowed">
                  This Piece is Sold Out
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => void save(product.id, 'cart', cartQuantity + 1)}
                    disabled={!ready || busy || cartQuantity >= availableQuantity(product)}
                    className="flex-1 py-4 rounded-full bg-slate-900 hover:bg-sky-600 text-white font-semibold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 cursor-pointer"
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => void save(product.id, 'wishlist', isWishlisted ? 0 : 1)}
                    disabled={!ready || busy}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-pressed={isWishlisted}
                    className={`p-4 rounded-full border transition-colors cursor-pointer ${
                      isWishlisted
                        ? 'border-rose-200 bg-rose-50 text-rose-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-sans pt-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Authenticity & Quality Inspected by Second JLITCH</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
