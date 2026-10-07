-- Phase 3: account-owned wishlist and cart entries. Prices and stock stay in products.
CREATE TABLE public.customer_items (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('cart', 'wishlist')),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 99 AND (kind <> 'wishlist' OR quantity = 1)),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id, kind)
);
CREATE INDEX customer_items_product_id_idx ON public.customer_items(product_id);
ALTER TABLE public.customer_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customer_items FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_items TO authenticated;
CREATE POLICY "Customers read their own items" ON public.customer_items FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Customers delete their own items" ON public.customer_items FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Customers add their own available items" ON public.customer_items FOR INSERT TO authenticated WITH CHECK (
  user_id = (SELECT auth.uid()) AND EXISTS (
    SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_catalog_visible
    AND ((kind = 'wishlist' AND p.status IN ('active', 'sold')) OR (kind = 'cart' AND p.status = 'active' AND quantity <= p.inventory_quantity))
  )
);
CREATE POLICY "Customers update their own available items" ON public.customer_items FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (
  user_id = (SELECT auth.uid()) AND EXISTS (
    SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_catalog_visible
    AND ((kind = 'wishlist' AND p.status IN ('active', 'sold')) OR (kind = 'cart' AND p.status = 'active' AND quantity <= p.inventory_quantity))
  )
);
