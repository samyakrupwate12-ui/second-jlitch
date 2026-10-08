'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/home/Hero';
import ProductGrid from '@/components/product/ProductGrid';

import { getPublicProducts } from '@/lib/products-db';
import { mapDbProductToProduct } from '@/lib/productMapper';
import { Product } from '@/types/product';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadHomeProducts() {
      try {
        setError(false);
        const dbItems = await getPublicProducts();
        if (dbItems && dbItems.length > 0) {
          const mapped = dbItems.map(mapDbProductToProduct);
          const featured = mapped.filter((p) => p.isFeatured);
          setProducts(featured.length > 0 ? featured.slice(0, 3) : mapped.slice(0, 3));
        }
      } catch {
        setError(true);
      }
    }
    loadHomeProducts();
  }, [attempt]);

  return (
    <div className="flex-grow flex flex-col">
      {/* Hero Section */}
      <Hero />

      {/* Product Preview Section ("THE NEW EDIT") matching Reference Screenshot 3 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        {error && <div role="alert" className="text-center text-sm text-slate-600">Unable to load featured pieces. <button className="underline" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>}
        <ProductGrid
          products={products}
          title="THE NEW EDIT"
          footerNote="Good pieces deserve another story."
          columns="3"
        />

        {/* View All Button */}
        <div className="mt-4 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 text-slate-800 text-xs tracking-widest uppercase font-semibold hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50/50 transition-all group"
          >
            <span>VIEW ALL COLLECTIONS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Value Statement Banner */}
      <div className="w-full bg-gradient-to-r from-sky-50 via-sky-100/50 to-sky-50 py-14 px-4 text-center border-t border-sky-100 mt-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="text-2xl sm:text-3xl font-serif text-slate-900">
            Pre-loved Pieces. Brighter Tomorrows.
          </h3>
          <p className="text-sm text-slate-600 font-sans leading-relaxed">
            Every garment carries memories. By passing them on, we extend their life cycle, reduce fashion footprint, and embrace conscious style.
          </p>
        </div>
      </div>
    </div>
  );
}
