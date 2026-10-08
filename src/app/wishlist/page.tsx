'use client';

import { useShop } from '@/context/ShopContext';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

import { Heart, ArrowRight } from 'lucide-react';
import SkyBackground from '@/components/ui/SkyBackground';

export default function WishlistPage() {
  const { items, products, ready, busy, save } = useShop();
  const wishlistItems = items.filter(i => i.kind === 'wishlist');

  return (
    <div className="flex-grow flex flex-col pb-12">
      {/* Header Banner */}
      <div className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8 sky-hero-gradient border-b border-sky-100 overflow-hidden">
        <SkyBackground />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-sky-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
            <span>Saved Favourites</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif text-slate-900 tracking-tight">
            Your Wishlist
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-sans max-w-md mx-auto">
            Pieces you have saved for later. Ready when you are.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8">
        {!ready ? <p role="status" className="text-center p-12">Loading your wishlist…</p> : wishlistItems.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {wishlistItems.length} Saved {wishlistItems.length === 1 ? 'Item' : 'Items'}
              </span>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {wishlistItems.map(item => products[item.product_id] ? (
                <ProductCard key={item.product_id} product={products[item.product_id]} />
              ) : <div key={item.product_id} className="rounded-2xl bg-white p-5"><p>This piece is no longer available.</p><button disabled={busy} onClick={() => void save(item.product_id, 'wishlist', 0)} className="mt-3 text-rose-600 underline">Remove from wishlist</button></div>)}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-sky-100 p-8 max-w-md mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-400 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-serif text-slate-900">Your wishlist is empty</h2>
            <p className="text-xs text-slate-500 mt-2 font-sans leading-relaxed">
              Explore our curated selection and tap the heart icon on any piece you love to save it here.
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wider uppercase hover:bg-sky-900 transition-colors shadow-xs"
              >
                <span>EXPLORE THE EDIT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
