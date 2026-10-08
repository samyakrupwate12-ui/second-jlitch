'use client';

import { useShop } from '@/context/ShopContext';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { items, save, ready, busy } = useShop();
  const isWishlisted = items.some(i => i.kind === 'wishlist' && i.product_id === product.id);

  const isSoldOut = product.inventoryQuantity === 0 || product.status === 'sold';
  const detailHref = `/products/${product.slug || product.id}`;

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl p-2.5 sm:p-3 transition-all duration-300 hover:shadow-xl hover:shadow-sky-100/60 border border-slate-100/80">
      
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-xl bg-slate-50 mb-3">
        <Link href={detailHref} className="block w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${
              isSoldOut ? 'opacity-85 grayscale-[20%]' : ''
            }`}
          />
        </Link>

        {/* Wishlist Heart Button Overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            void save(product.id, 'wishlist', isWishlisted ? 0 : 1);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-700 hover:text-rose-500 hover:bg-white shadow-sm transition-all transform active:scale-90 z-10"
          disabled={!ready || busy}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'stroke-[1.75]'
            }`}
          />
        </button>

        {/* Sold Out Badge (Requirement 6) */}
        {isSoldOut ? (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-block px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-slate-900/90 text-white rounded-full backdrop-blur-md shadow-sm">
              Sold Out
            </span>
          </div>
        ) : product.productType === 'Pre-Loved' ? (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-block px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase bg-indigo-600/90 text-white rounded-full backdrop-blur-md shadow-sm">
              Pre-Loved
            </span>
          </div>
        ) : null}

        {/* Optional Condition Badge */}
        {product.condition && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-block px-2.5 py-1 text-[11px] font-medium bg-white/85 backdrop-blur-md text-slate-700 rounded-full shadow-xs">
              {product.condition}
            </span>
          </div>
        )}
      </div>

      {/* Content Metadata */}
      <div className="flex flex-col flex-grow px-1 pb-1">
        <Link href={detailHref} className="group-hover:text-sky-700 transition-colors">
          <h3 className="font-serif text-sm sm:text-base font-medium text-slate-900 leading-snug line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-semibold text-slate-900 font-sans">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.size && (
            <span className="text-xs text-slate-500 font-sans">
              {product.size}
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
