'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllProductsAdmin, updateProduct } from '@/lib/products-db';
import { DbProduct } from '@/types/db';
import {
  Sparkles,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
} from 'lucide-react';

export default function AdminPreLovedPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPreLovedProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProductsAdmin({
        product_type: 'Pre-Loved',
        search: searchQuery,
      });
      setProducts(data);
    } catch (err: any) {
      console.error('Error fetching pre-loved items:', err);
      setErrorMsg(err.message || 'Failed to fetch pre-loved items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreLovedProducts();
  }, []);

  const handleToggleVisibility = async (prod: DbProduct) => {
    try {
      await updateProduct(prod.id, { is_catalog_visible: !prod.is_catalog_visible });
      setSuccessMsg(`Updated visibility for ${prod.name}`);
      fetchPreLovedProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update item');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Second JLITCH Owned Stock</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Pre-Loved Portal</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-xl">
            Curated pre-loved garments owned and sold directly by Second JLITCH. No customer submissions, no consignment, no seller payouts.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pre-Loved Item</span>
        </Link>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 font-bold text-xs">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 font-bold text-xs">✕</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchPreLovedProducts();
          }}
          className="relative w-full sm:max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pre-loved inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
          <Shield className="w-4 h-4 text-indigo-500" />
          <span>Internal Stock Only</span>
        </div>
      </div>

      {/* Pre-Loved Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
            <p className="text-xs mt-2 font-sans">Loading pre-loved garments...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="text-base font-serif text-slate-800">No Pre-Loved items listed yet</p>
            <p className="text-xs text-slate-500">
              Create a product and set Product Type to &quot;Pre-Loved&quot;.
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Pre-Loved Garment</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-sans">
                  <th className="py-3.5 px-4">Garment</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Catalog Visible</th>
                  <th className="py-3.5 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {products.map((prod) => {
                  const primaryImg =
                    prod.product_images?.find((img) => img.is_primary)?.image_url ||
                    prod.product_images?.[0]?.image_url ||
                    '/images/products/linen-blend-blouse.jpg';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            <Image
                              src={primaryImg}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${prod.id}`}
                              className="font-semibold text-slate-900 font-serif text-sm hover:text-indigo-600 transition-colors line-clamp-1"
                            >
                              {prod.name}
                            </Link>
                            <p className="text-[11px] text-slate-400 font-mono">{prod.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                          {prod.condition || 'Pre-Loved'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans">{prod.size || 'N/A'}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        ₹{Number(prod.price).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {prod.inventory_quantity === 0 ? (
                          <span className="text-rose-600 font-semibold">0 (Sold Out)</span>
                        ) : (
                          <span>{prod.inventory_quantity}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            prod.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prod.status === 'sold'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {prod.status === 'active' ? 'Published' : prod.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleVisibility(prod)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                            prod.is_catalog_visible
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {prod.is_catalog_visible ? (
                            <>
                              <Eye className="w-3 h-3 text-sky-600" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-slate-400" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/products/${prod.id}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-600 transition-colors inline-block"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
