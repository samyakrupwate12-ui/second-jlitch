'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Shirt, Sparkles, Loader2 } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { PLACEHOLDER_PRODUCTS } from '@/lib/placeholder-data';
import { getPublicProducts } from '@/lib/products-db';
import { mapDbProductToProduct } from '@/lib/productMapper';
import { Product } from '@/types/product';
import SkyBackground from '@/components/ui/SkyBackground';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const categories = [
    { name: 'All', icon: Sparkles },
    { name: 'Tops', icon: Shirt },
    { name: 'Bottoms', icon: Shirt },
    { name: 'Outerwear', icon: Shirt },
    { name: 'Accessories', icon: Sparkles },
  ];

  const quickFilters = ['All', 'Under ₹999', 'Like New', 'Excellent'];

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const dbItems = await getPublicProducts();
        if (dbItems && dbItems.length > 0) {
          setProducts(dbItems.map(mapDbProductToProduct));
        } else {
          setProducts(PLACEHOLDER_PRODUCTS);
        }
      } catch (err) {
        console.error('Error fetching public products:', err);
        setProducts(PLACEHOLDER_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter products based on search, category, and quick filter
  const filteredProducts = products.filter((prod) => {
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesName = prod.name.toLowerCase().includes(query);
      const matchesCategory = prod.category.toLowerCase().includes(query);
      if (!matchesName && !matchesCategory) return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && prod.category !== selectedCategory) {
      return false;
    }

    // Quick filter
    if (selectedFilter === 'Under ₹999' && prod.price >= 999) {
      return false;
    }
    if (selectedFilter === 'Like New' && prod.condition !== 'Like New') {
      return false;
    }
    if (selectedFilter === 'Excellent' && prod.condition !== 'Excellent') {
      return false;
    }

    return true;
  });

  return (
    <div className="flex-grow flex flex-col pb-12">
      
      {/* Sky Header Banner */}
      <div className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden sky-hero-gradient border-b border-sky-100">
        <SkyBackground />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-2">
          <span className="text-xs tracking-[0.25em] font-semibold text-sky-600 uppercase font-sans">
            EXPLORE
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-slate-900 tracking-tight">
            Thoughtfully curated pieces.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-sans max-w-lg mx-auto">
            Pre-loved fashion for a brighter tomorrow.
          </p>

          {/* Pill Search Bar */}
          <div className="pt-6 max-w-lg mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for clothes, brands, style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/90 backdrop-blur-md rounded-full border border-sky-100/80 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all"
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
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-200 scale-105'
                      : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-100'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[1.6]" />
                </div>
                <span
                  className={`text-xs font-sans ${
                    isCatActive ? 'font-semibold text-sky-600' : 'text-slate-600'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Filter Badges Row */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 border-y border-slate-100 mb-8 no-scrollbar">
          {quickFilters.map((filter) => {
            const isFilterActive = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isFilterActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter}
              </button>
            );
          })}

          <button className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100/80 transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-500" />
            <p className="text-xs text-slate-400 mt-2 font-sans">Loading collection...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-sky-100 p-8 max-w-md mx-auto">
            <p className="text-lg font-serif text-slate-800">No pieces found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or filter selection.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedFilter('All');
              }}
              className="mt-4 px-4 py-2 bg-sky-50 text-sky-600 text-xs font-medium rounded-full hover:bg-sky-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
