'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllProductsAdmin } from '@/lib/products-db';
import { DbProduct, PRODUCT_STATUS_LABELS } from '@/types/db';
import {
  Package,
  Sparkles,
  Boxes,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getAllProductsAdmin();
        setProducts(data);
      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Failed to fetch inventory stats');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalProducts = products.length;
  const publishedCount = products.filter((p) => p.status === 'active').length;
  const preLovedCount = products.filter((p) => p.product_type?.toLowerCase() === 'pre-loved').length;
  const outOfStockCount = products.filter((p) => p.inventory_quantity === 0).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="text-xs font-semibold tracking-widest text-sky-400 uppercase font-sans">
            SECOND JLITCH OVERVIEW
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-lg">
            Manage product catalog, pre-loved stock, inventory quantities, and publishing states.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link
            href="/admin/products/new"
            className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-lg shadow-sky-500/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider font-sans">
              Total Products
            </p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {loading ? '...' : totalProducts}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Published Active */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider font-sans">
              Published Active
            </p>
            <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
              {loading ? '...' : publishedCount}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Pre-Loved Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider font-sans">
              Pre-Loved Stock
            </p>
            <p className="text-2xl font-bold font-mono text-indigo-600 mt-1">
              {loading ? '...' : preLovedCount}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider font-sans">
              Sold / Stock 0
            </p>
            <p className="text-2xl font-bold font-mono text-amber-600 mt-1">
              {loading ? '...' : outOfStockCount}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-xl transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold font-serif text-slate-900 group-hover:text-sky-600 transition-colors">
            Product Management
          </h3>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            View, edit, archive, or create products with complete image management.
          </p>
          <div className="flex items-center text-xs font-semibold text-sky-600 gap-1 pt-1">
            <span>Manage Products</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/pre-loved"
          className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-xl transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold font-serif text-slate-900 group-hover:text-indigo-600 transition-colors">
            Pre-Loved Section
          </h3>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            Manage Second JLITCH owned pre-loved garments and curated thrift inventory.
          </p>
          <div className="flex items-center text-xs font-semibold text-indigo-600 gap-1 pt-1">
            <span>View Pre-Loved Stock</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/inventory"
          className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-xl transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold font-serif text-slate-900 group-hover:text-amber-600 transition-colors">
            Inventory Grid
          </h3>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            Fast stock quantity editor and catalogue visibility controls.
          </p>
          <div className="flex items-center text-xs font-semibold text-amber-600 gap-1 pt-1">
            <span>Update Inventory</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Products List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold font-serif text-slate-900">
            Recently Added Products
          </h2>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-sky-600 hover:underline font-sans"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-500" />
            <p className="text-xs mt-2 font-sans">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-serif text-slate-700">No products in Supabase yet</p>
            <p className="text-xs text-slate-500">Create your first product to get started.</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Create Product</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-sans">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {products.slice(0, 5).map((prod) => {
                  const primaryImg =
                    prod.product_images?.find((img) => img.is_primary)?.image_url ||
                    prod.product_images?.[0]?.image_url ||
                    '/images/products/linen-blend-blouse.jpg';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                            <Image
                              src={primaryImg}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 font-sans line-clamp-1">
                              {prod.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{prod.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            prod.product_type?.toLowerCase() === 'pre-loved'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-sky-50 text-sky-700 border border-sky-100'
                          }`}
                        >
                          {prod.product_type?.toLowerCase() === 'pre-loved' ? 'Pre-Loved' : 'New'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        ₹{Number(prod.price).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {prod.inventory_quantity === 0 ? (
                          <span className="text-rose-600 font-semibold">0 (Sold)</span>
                        ) : (
                          <span>{prod.inventory_quantity}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            prod.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prod.status === 'draft'
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : prod.status === 'sold'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {PRODUCT_STATUS_LABELS[prod.status] || prod.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/products/${prod.id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-600 font-semibold text-xs transition-colors"
                        >
                          Edit
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
