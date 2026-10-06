-- ==================================================
-- SECOND JLITCH — SUPABASE RLS SECURITY POLICIES
-- ==================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 2. admin_users Table Policies
-- Authenticated users can check if their own user_id exists in admin_users
CREATE POLICY "Allow users to read admin status" ON public.admin_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 3. products Table Policies
-- Public can read products that are catalogue visible, OR authenticated admins can read all products
CREATE POLICY "Public can view catalog visible products" ON public.products
  FOR SELECT USING (
    is_catalog_visible = true
    OR (auth.uid() IN (SELECT user_id FROM public.admin_users))
  );

-- Admins can insert products
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Admins can update products
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Admins can delete products
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 4. product_images Table Policies
-- Public can view product images
CREATE POLICY "Public can view product images" ON public.product_images
  FOR SELECT USING (true);

-- Admins can insert product images
CREATE POLICY "Admins can insert product images" ON public.product_images
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Admins can update product images
CREATE POLICY "Admins can update product images" ON public.product_images
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Admins can delete product images
CREATE POLICY "Admins can delete product images" ON public.product_images
  FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- 5. Storage Bucket Policies (product-images bucket)
-- Ensure storage bucket RLS permits public reads and admin uploads
CREATE POLICY "Public Read Product Images Storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin Upload Product Images Storage" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' 
    AND (auth.uid() IN (SELECT user_id FROM public.admin_users))
  );

CREATE POLICY "Admin Update Product Images Storage" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images' 
    AND (auth.uid() IN (SELECT user_id FROM public.admin_users))
  );

CREATE POLICY "Admin Delete Product Images Storage" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images' 
    AND (auth.uid() IN (SELECT user_id FROM public.admin_users))
  );
