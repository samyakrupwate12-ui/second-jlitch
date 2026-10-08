'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Shirt, Sparkles, Loader2 } from 'lucide-react';
import { filterCatalogue, defaultFilters, type CatalogueFilters } from '@/lib/catalogue';
import ProductCard from '@/components/product/ProductCard';

import { getPublicProducts } from '@/lib/products-db';
import { mapDbProductToProduct } from '@/lib/productMapper';
import { Product } from '@/types/product';
import SkyBackground from '@/components/ui/SkyBackground';

export default function CatalogueView({ preLovedOnly = false }: { preLovedOnly?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CatalogueFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const updateFilter = <K extends keyof CatalogueFilters>(key: K, value: CatalogueFilters[K]) => setFilters(previous => ({ ...previous, [key]: value }));
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))].map(name => ({ name, icon: name === 'All' ? Sparkles : Shirt }));
  const quickFilters = ['All', 'Under ₹999', 'Like New', 'Excellent'];
  const selectedFilter = filters.under999 ? 'Under ₹999' : filters.condition;
  const selectedCategory = filters.category;
  const searchQuery = filters.search;
  const setSelectedCategory = (category: string) => updateFilter('category', category);
  const setSearchQuery = (search: string) => updateFilter('search', search);
  const setSelectedFilter = (value: string) => setFilters(previous => ({ ...previous, under999: value === 'Under ₹999', condition: ['Like New', 'Excellent'].includes(value) ? value : 'All' }));

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      setLoading(true);
      setError('');
      try {
        const data = await getPublicProducts(preLovedOnly);
        if (active) setProducts(data.map(mapDbProductToProduct));
      } catch {
        if (active) setError('Unable to load the collection. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProducts();
    const refresh = () => setAttempt(value => value + 1);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [preLovedOnly, attempt]);

  const filteredProducts = filterCatalogue(products, filters);

  return (
    <div className="flex-grow flex flex-col pb-12">
      
      {/* Sky Header Banner */}
      <div className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden sky-hero-gradient border-b border-sky-100">
        <SkyBackground />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-2">
          <span className="text-xs tracking-[0.25em] font-semibold text-sky-600 uppercase font-sans">
            {preLovedOnly ? 'PRE-LOVED COLLECTION' : 'EXPLORE'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-slate-900 tracking-tight">
            {preLovedOnly ? 'Curated Pre-Loved Garments.' : 'Thoughtfully curated pieces.'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-sans max-w-lg mx-auto">
            Pre-loved fashion for a brighter tomorrow.
          </p>

          {/* Pill Search Bar */}
          <div className="pt-6 max-w-lg mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="search"
                aria-label="Search products"
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
                aria-pressed={isCatActive}
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
                aria-pressed={isFilterActive}
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

          <button onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} aria-controls="catalogue-filters" className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100/80 transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>

        {showFilters && (
          <div id="catalogue-filters" className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 rounded-2xl border border-sky-100 bg-white text-xs">
            <label className="space-y-2">Size
              <select aria-label="Size" value={filters.size} onChange={e => updateFilter('size', e.target.value)} className="block w-full border border-slate-200 rounded-lg p-2">
                {['All', ...new Set(products.map(p => p.size).filter((v): v is string => !!v))].map(value => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="space-y-2">Condition
              <select aria-label="Condition" value={filters.condition} onChange={e => updateFilter('condition', e.target.value)} className="block w-full border border-slate-200 rounded-lg p-2">
                {['All', ...new Set(products.map(p => p.condition).filter(Boolean))].map(value => <option key={value}>{value}</option>)}
              </select>
            </label>
            {!preLovedOnly && <label className="space-y-2">Collection
              <select aria-label="Collection" value={filters.type} onChange={e => updateFilter('type', e.target.value)} className="block w-full border border-slate-200 rounded-lg p-2">
                {['All', 'New', 'Pre-Loved'].map(value => <option key={value}>{value}</option>)}
              </select>
            </label>}
            <label className="flex items-center gap-2"><input type="checkbox" checked={filters.inStock} onChange={e => updateFilter('inStock', e.target.checked)} />In stock only</label>
            <button onClick={() => setFilters(defaultFilters)} className="text-sky-700 underline text-left">Reset filters</button>
          </div>
        )}
        <div className="flex items-center justify-between mb-5 text-xs text-slate-600">
          <span aria-live="polite">{loading ? 'Loading…' : error ? 'Collection unavailable' : `${filteredProducts.length} pieces`}</span>
          <select aria-label="Sort products" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)} className="bg-white border border-slate-200 rounded-full px-3 py-2">
            <option value="newest">Newest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>

        {/* Product Grid */}
        {error ? (
          <div role="alert" className="text-center py-12 rounded-2xl bg-white border border-sky-100">
            <p>{error}</p><button className="mt-4 text-sky-700 underline" onClick={() => setAttempt(value => value + 1)}>Try again</button>
          </div>
        ) : loading ? (
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
                setFilters(defaultFilters);
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
