'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProductByIdOrSlug } from '@/lib/products-db';
import { DbProduct } from '@/types/db';
import ProductForm from '@/components/admin/ProductForm';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await getProductByIdOrSlug(id);
        if (!data) {
          setError(`Product with ID "${id}" could not be found.`);
        } else {
          setProduct(data);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading product.');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-500" />
        <p className="text-xs mt-2 font-sans">Loading product data...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-serif font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500 font-sans">{error}</p>
        <Link
          href="/admin/products"
          className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          Return to Products
        </Link>
      </div>
    );
  }

  return <ProductForm initialProduct={product} isEdit={true} />;
}
