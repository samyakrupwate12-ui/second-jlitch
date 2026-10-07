'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { mapDbProductToProduct } from '@/lib/productMapper';
import type { DbProduct } from '@/types/db';
import type { Product } from '@/types/product';
import { availableQuantity, GUEST_KEY, parseSavedItems, type SavedItem, type SavedKind } from '@/lib/shopping';

type ShopState = {
  user: User | null; authReady: boolean; recovery: boolean; finishRecovery: () => void;
  items: SavedItem[]; products: Record<string, Product>; ready: boolean; busy: boolean;
  error: string; cartCount: number; refresh: () => void;
  save: (id: string, kind: SavedKind, quantity: number) => Promise<boolean>;
};
const ShopContext = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const locked = useRef(false);
  const generation = useRef(0);
  const refresh = useCallback(() => setRevision(v => v + 1), []);
  const userId = user?.id;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
      if (event === 'PASSWORD_RECOVERY' || (session?.user && new URLSearchParams(window.location.search).get('reset') === '1')) setRecovery(true);
      if (event === 'SIGNED_OUT') { setRecovery(false); setItems([]); setReady(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onFocus = () => { if (!locked.current) refresh(); };
    const onStorage = (event: StorageEvent) => { if (event.key === GUEST_KEY && !userId) onFocus(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('focus', onFocus); window.removeEventListener('storage', onStorage); };
  }, [refresh, userId]);

  useEffect(() => {
    if (!authReady || pathname.startsWith('/admin')) return;
    const version = ++generation.current;
    let cancelled = false;
    async function load() {
      setReady(false);
      setItems([]);
      setError('');
      try {
        const { data: catalog, error: catalogError } = await supabase.from('products')
          .select('*, product_images(*)').eq('is_catalog_visible', true).in('status', ['active', 'sold']);
        if (catalogError) throw catalogError;
        const mapped = Object.fromEntries((catalog as DbProduct[]).map(p => [p.id, mapDbProductToProduct(p)]));
        const guest = parseSavedItems(localStorage.getItem(GUEST_KEY));
        let saved = guest;
        if (userId) {
          // Import only valid guest choices; existing account choices win on duplicates.
          const additions = guest.filter(i => mapped[i.product_id] && (i.kind === 'wishlist' || availableQuantity(mapped[i.product_id]) > 0))
            .map(i => ({ ...i, user_id: userId, quantity: i.kind === 'cart' ? Math.min(i.quantity, availableQuantity(mapped[i.product_id])) : 1 }));
          if (cancelled || generation.current !== version) return;
          if (additions.length) {
            const { error: mergeError } = await supabase.from('customer_items').upsert(additions, { onConflict: 'user_id,product_id,kind', ignoreDuplicates: true });
            if (mergeError) throw mergeError;
          }
          const { data, error: readError } = await supabase.from('customer_items').select('product_id,kind,quantity').eq('user_id', userId);
          if (readError) throw readError;
          saved = data as SavedItem[];
          if (!cancelled && generation.current === version) {
            localStorage.removeItem(GUEST_KEY);
            if (additions.length < guest.length) setError('Some guest items are no longer available and could not be saved to your account.');
          }
        }
        if (!cancelled && generation.current === version) { setProducts(mapped); setItems(saved); setReady(true); }
      } catch {
        if (!cancelled) setError('We couldn’t load your saved items. Please retry.');
      }
    }
    void load();
    return () => { cancelled = true; generation.current = version + 1; };
  }, [authReady, userId, revision, pathname]);

  async function save(id: string, kind: SavedKind, quantity: number): Promise<boolean> {
    if (!ready || locked.current) return false;
    const version = generation.current;
    locked.current = true; setBusy(true); setError('');
    try {
      if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) throw new Error('Choose a quantity between 1 and 99.');
      if (quantity > 0) {
        const { data, error: productError } = await supabase.from('products').select('*, product_images(*)')
          .eq('id', id).eq('is_catalog_visible', true).in('status', ['active', 'sold']).maybeSingle();
        if (productError) throw new Error('Unable to check availability. Please retry.');
        if (!data) throw new Error('This piece is no longer available.');
        const product = mapDbProductToProduct(data as DbProduct);
        if (version !== generation.current) return false;
        setProducts(p => ({ ...p, [id]: product }));
        if (kind === 'cart' && quantity > availableQuantity(product)) throw new Error(`Only ${availableQuantity(product)} available. Please adjust your bag.`);
      }
      if (version !== generation.current) return false;
      const next = items.filter(i => !(i.product_id === id && i.kind === kind));
      if (quantity > 0) next.push({ product_id: id, kind, quantity: kind === 'wishlist' ? 1 : quantity });
      if (userId) {
        const result = quantity === 0
          ? await supabase.from('customer_items').delete().eq('user_id', userId).eq('product_id', id).eq('kind', kind)
          : await supabase.from('customer_items').upsert({ user_id: userId, product_id: id, kind, quantity: kind === 'wishlist' ? 1 : quantity }, { onConflict: 'user_id,product_id,kind' });
        if (result.error) throw new Error('Couldn’t save this change. Please refresh and retry.');
      } else { localStorage.setItem(GUEST_KEY, JSON.stringify(next)); }
      if (version === generation.current) setItems(next);
      return true;
    } catch (err) {
      if (version === generation.current) setError(err instanceof Error ? err.message : 'Couldn’t save your changes.');
      return false;
    } finally { locked.current = false; setBusy(false); }
  }

  return <ShopContext.Provider value={{ user, authReady, recovery, finishRecovery: () => { setRecovery(false); const url = new URL(window.location.href); url.searchParams.delete('reset'); window.history.replaceState({}, '', url.pathname + url.search + url.hash); }, items, products, ready, busy, error, cartCount: items.filter(i => i.kind === 'cart').reduce((n, i) => n + i.quantity, 0), refresh, save }}>
    {!pathname.startsWith('/admin') && error && <div role="alert" className="sticky top-0 z-50 bg-rose-50 p-3 text-center text-sm text-rose-800">{error} <button onClick={refresh} disabled={busy} className="underline font-semibold">Retry</button></div>}
    {children}
  </ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop requires ShopProvider');
  return context;
}
