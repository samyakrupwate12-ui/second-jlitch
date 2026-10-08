'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles, Shirt, SlidersHorizontal, Loader2 } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import SkyBackground from '@/components/ui/SkyBackground';
import { getPreLovedPublicProducts } from '@/lib/products-db';
import { mapDbProductToProduct } from '@/lib/productMapper';

import { Product } from '@/types/product';

export default function PreLovedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    { name: 'All', icon: Sparkles },
    { name: 'Tops', icon: Shirt },
    { name: 'Bottoms', icon: Shirt },
    { name: 'Outerwear', icon: Shirt },
    { name: 'Accessories', icon: Sparkles },
  ];

  useEffect(() => {
    async function loadPreLoved() {
      try {
        setLoading(true);
        const dbItems = await getPreLovedPublicProducts();
        if (dbItems && dbItems.length > 0) {
          setProducts(dbItems.map(mapDbProductToProduct));
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching pre-loved items:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadPreLoved();
  }, []);

  const filteredProducts = products.filter((prod) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchCat = prod.category.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }
    if (selectedCategory !== 'All' && prod.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-grow flex flex-col pb-12">
      {/* Sky Header Banner for Pre-Loved */}
      <div className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden sky-hero-gradient border-b border-sky-100">
        <SkyBackground />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-2">
          <span className="text-xs tracking-[0.25em] font-semibold text-indigo-600 uppercase font-sans flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRE-LOVED COLLECTION</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-slate-900 tracking-tight">
            Curated Pre-Loved Garments.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-sans max-w-lg mx-auto">
            Every garment has a history. Carefully selected and verified by Second JLITCH.
          </p>

          {/* Pill Search Bar */}
          <div className="pt-6 max-w-lg mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search pre-loved tops, knitwear, denim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/90 backdrop-blur-md rounded-full border border-sky-100/80 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all font-sans"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8">
        {/* Category Icons Row */}
        <div className="flex items-center justify-start sm:justify-center gap-4 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isCatActive = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="flex flex-col items-center gap-2 min-w-[64px] group"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isCatActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                      : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-100'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[1.6]" />
                </div>
                <span
                  className={`text-xs font-sans ${
                    isCatActive ? 'font-semibold text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
            <p className="text-xs text-slate-400 mt-2 font-sans">Loading pre-loved catalogue...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 pt-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-sky-100 p-8 max-w-md mx-auto">
            <p className="text-lg font-serif text-slate-800">No pre-loved pieces match your filter</p>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Try changing search keywords or category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full hover:bg-indigo-100 transition-colors font-sans"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
