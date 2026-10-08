'use client';

import { statusAfterStockChange } from '@/lib/catalogue';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getAllProductsAdmin, updateProduct, updateProductVisibility } from '@/lib/products-db';
import { DbProduct, PRODUCT_STATUS_LABELS } from '@/types/db';
import {
  Boxes,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Minus,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getAllProductsAdmin();
      setProducts(data);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setErrorMsg(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (prod: DbProduct, newQty: number) => {
    if (!Number.isInteger(newQty) || newQty < 0 || updatingId) return;
    setUpdatingId(prod.id);
    setErrorMsg(null);

    const newStatus = statusAfterStockChange(prod.status, newQty);

    try {
      await updateProduct(prod.id, {
        inventory_quantity: newQty,
        status: newStatus,
      });
      setSuccessMsg(`Updated "${prod.name}" stock to ${newQty}`);
      await fetchInventory();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleVisibility = async (prod: DbProduct) => {
    if (updatingId) return;
    setUpdatingId(prod.id);
    try {
      await updateProductVisibility(prod.id, !prod.is_catalog_visible);
      setSuccessMsg(`Toggled catalog visibility for "${prod.name}"`);
      await fetchInventory();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update visibility');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-slate-900 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider font-sans">
            <Boxes className="w-3.5 h-3.5" />
            <span>Stock & Catalogue Controls</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Inventory Management</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-xl">
            Catalogue visibility is separate from physical inventory. Out-of-stock products (stock = 0) can remain visible on the customer site when enabled.
          </p>
        </div>
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

      {/* Inventory Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
            <p className="text-xs mt-2 font-sans">Loading stock items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <p className="text-base font-serif text-slate-800">No inventory products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-sans">
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Physical Inventory</th>
                  <th className="py-3.5 px-4">Catalogue Visibility</th>
                  <th className="py-3.5 px-4 text-right">Customer Display Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {products.map((prod) => {
                  const primaryImg =
                    prod.product_images?.find((img) => img.is_primary)?.image_url ||
                    prod.product_images?.[0]?.image_url ||
                    '/images/product-placeholder.svg';

                  const isUpdating = updatingId === prod.id;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            <Image
                              src={primaryImg}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 font-serif text-sm">
                              {prod.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{prod.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-sans">{prod.category}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            prod.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : prod.status === 'sold'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {PRODUCT_STATUS_LABELS[prod.status] || prod.status}
                        </span>
                      </td>

                      {/* Stock Quantity Stepper */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateStock(prod, prod.inventory_quantity - 1)}
                            disabled={!!updatingId || prod.inventory_quantity <= 0}
                            className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center font-mono font-bold text-slate-900 text-sm">
                            {prod.inventory_quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateStock(prod, prod.inventory_quantity + 1)}
                            disabled={!!updatingId}
                            className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Catalogue Visibility Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleVisibility(prod)}
                          disabled={!!updatingId}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            prod.is_catalog_visible
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {prod.is_catalog_visible ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-sky-600" />
                              <span>Catalogue Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                              <span>Hidden from Site</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Status Explanation Rule */}
                      <td className="py-3.5 px-4 text-right">
                        {prod.is_catalog_visible ? (
                          prod.inventory_quantity === 0 ? (
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                              Visible as Sold Out
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                              Visible in Store
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                            Hidden from Catalogue
                          </span>
                        )}
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
