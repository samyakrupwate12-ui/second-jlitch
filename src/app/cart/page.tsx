'use client';

import { useShop } from '@/context/ShopContext';
import { availableQuantity } from '@/lib/shopping';
import Image from 'next/image';
import Link from 'next/link';

import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import SkyBackground from '@/components/ui/SkyBackground';

export default function CartPage() {
  const { items, products, ready, busy, save, user } = useShop();
  const cartItems = items.filter(i => i.kind === 'cart').map(i => ({ ...i, product: products[i.product_id] }));
  const subtotal = cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
  const removeItem = (id: string) => void save(id, 'cart', 0);

  return (
    <div className="flex-grow flex flex-col pb-12">
      {/* Header Banner */}
      <div className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8 sky-hero-gradient border-b border-sky-100 overflow-hidden">
        <SkyBackground />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-sky-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shopping Bag</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif text-slate-900 tracking-tight">
            Your Cart
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-sans max-w-md mx-auto">
            Selected curated pieces ready for their new story.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8">
        {!ready ? <p role="status" className="text-center p-12">Loading your bag…</p> : cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map(({ product, quantity, product_id }) => !product ? <div key={product_id} className="rounded-2xl bg-white p-5"><p>This piece is no longer available.</p><button disabled={busy} onClick={() => removeItem(product_id)} className="mt-3 underline text-rose-600">Remove from bag</button></div> : (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-sky-100 transition-all"
                >
                  <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-base font-medium text-slate-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {product.condition} {product.size ? `| ${product.size}` : ''}
                        </p>
                      </div>

                      <button
                        disabled={busy}
                        onClick={() => removeItem(product.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <button aria-label={`Decrease quantity of ${product.name}`} disabled={busy || quantity <= 1} onClick={() => void save(product.id, 'cart', quantity - 1)} className="rounded-full border px-2 disabled:opacity-30">−</button>
                        <span aria-label="Quantity">{quantity}</span>
                        <button aria-label={`Increase quantity of ${product.name}`} disabled={busy || quantity >= Math.min(99, availableQuantity(product))} onClick={() => void save(product.id, 'cart', quantity + 1)} className="rounded-full border px-2 disabled:opacity-30">+</button>
                      </div>
                      <span className="text-base font-semibold text-slate-900">
                        ₹{(product.price * quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {quantity > availableQuantity(product) && <p role="status" className="mt-2 text-xs text-rose-600">{availableQuantity(product) === 0 ? 'This piece is sold out. Please remove it from your bag.' : `Only ${availableQuantity(product)} available. Reduce your quantity.`}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl p-6 border border-sky-100/90 shadow-md space-y-5 sticky top-24">
                {!user && <Link href="/account" className="block text-sm text-sky-700 underline">Sign in to save your bag to your account</Link>}
                <h2 className="font-serif text-xl text-slate-900 pb-3 border-b border-slate-100">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm font-sans">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-medium">Calculated at checkout</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="font-serif text-base text-slate-900 font-semibold">Items total</span>
                    <span className="text-xl font-bold text-slate-900">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-4 rounded-full bg-slate-900/40 text-white font-medium text-xs tracking-widest uppercase cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>CHECKOUT COMING SOON</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                  <span>Items in your bag are not reserved.</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-sky-100 p-8 max-w-md mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-400 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-serif text-slate-900">Your bag is empty</h2>
            <p className="text-xs text-slate-500 mt-2 font-sans leading-relaxed">
              Find unique pre-loved pieces in our curated catalog.
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
