'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllProductsAdmin, updateProduct, deleteProduct } from '@/lib/products-db';
import { DbProduct, ProductStatus } from '@/types/db';
import {
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Star,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getAllProductsAdmin({
        status: selectedStatus,
        product_type: selectedType,
        search: searchQuery,
      });
      setProducts(data);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setErrorMsg(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedStatus, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleToggleFeature = async (prod: DbProduct) => {
    try {
      await updateProduct(prod.id, { is_featured: !prod.is_featured });
      setSuccessMsg(`Updated featured state for ${prod.name}`);
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update product');
    }
  };

  const handleToggleVisibility = async (prod: DbProduct) => {
    try {
      await updateProduct(prod.id, { is_catalog_visible: !prod.is_catalog_visible });
      setSuccessMsg(`Updated catalog visibility for ${prod.name}`);
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update product');
    }
  };

  const handleStatusChange = async (productId: string, newStatus: ProductStatus) => {
    try {
      const payload: any = { status: newStatus };
      if (newStatus === 'sold') {
        payload.inventory_quantity = 0;
      }
      await updateProduct(productId, payload);
      setSuccessMsg(`Product status changed to ${newStatus}`);
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (productId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteProduct(productId);
      setSuccessMsg(`Deleted "${name}"`);
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Products Management</h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Manage catalogue, pre-loved stock, inventory, and status
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 no-scrollbar">
          {['All', 'active', 'draft', 'sold', 'archived'].map((st) => {
            const isActive = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st === 'All' ? 'All Products' : st === 'active' ? 'Published' : st}
              </button>
            );
          })}
        </div>

        {/* Search & Type Filter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, slug, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500 font-sans font-semibold">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="All">All Types</option>
              <option value="new">New</option>
              <option value="pre-loved">Pre-Loved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-500" />
            <p className="text-xs mt-2 font-sans">Fetching product catalogue...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <p className="text-base font-serif text-slate-800">No products found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search criteria or add a new product.
            </p>
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
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-sans">
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Inventory</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Catalog Visible</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {products.map((prod) => {
                  const primaryImg =
                    prod.product_images?.find((img) => img.is_primary)?.image_url ||
                    prod.product_images?.[0]?.image_url ||
                    '/images/products/linen-blend-blouse.jpg';

                  const isPreLoved = prod.product_type?.toLowerCase() === 'pre-loved';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            <Image
                              src={primaryImg}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                            {prod.is_featured && (
                              <div className="absolute top-1 left-1 p-0.5 rounded bg-amber-500 text-white">
                                <Star className="w-2.5 h-2.5 fill-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${prod.id}`}
                              className="font-semibold text-slate-900 font-serif text-sm hover:text-sky-600 transition-colors line-clamp-1"
                            >
                              {prod.name}
                            </Link>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {prod.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            isPreLoved
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-sky-50 text-sky-700 border border-sky-100'
                          }`}
                        >
                          {isPreLoved ? 'Pre-Loved' : 'New'}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-sans">{prod.category}</td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        ₹{Number(prod.price).toLocaleString('en-IN')}
                        {prod.original_price && (
                          <span className="block text-[10px] text-slate-400 line-through">
                            ₹{Number(prod.original_price).toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      {/* Inventory */}
                      <td className="py-3.5 px-4 font-mono">
                        {prod.inventory_quantity === 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-semibold text-[10px]">
                            0 (Sold Out)
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-900">{prod.inventory_quantity}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={prod.status}
                          onChange={(e) =>
                            handleStatusChange(prod.id, e.target.value as ProductStatus)
                          }
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border focus:outline-none cursor-pointer ${
                            prod.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : prod.status === 'draft'
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : prod.status === 'sold'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Published</option>
                          <option value="sold">Sold</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>

                      {/* Catalog Visibility Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleVisibility(prod)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                            prod.is_catalog_visible
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                          title="Toggle Catalogue Visibility"
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

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Feature toggle */}
                          <button
                            onClick={() => handleToggleFeature(prod)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              prod.is_featured
                                ? 'bg-amber-50 border-amber-200 text-amber-600'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
                            }`}
                            title={prod.is_featured ? 'Unfeature' : 'Feature Product'}
                          >
                            <Star className={`w-3.5 h-3.5 ${prod.is_featured ? 'fill-amber-500' : ''}`} />
                          </button>

                          {/* Edit button */}
                          <Link
                            href={`/admin/products/${prod.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 border border-slate-200 text-slate-700 hover:text-sky-600 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
