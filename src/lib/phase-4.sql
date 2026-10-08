-- Applied remotely as phase_four_catalogue_images. Reference only; do not reapply.
ALTER POLICY "Public can view catalogue products" ON public.products
  USING (is_catalog_visible = true AND status IN ('active', 'sold'));
ALTER POLICY "Public can view product images" ON public.product_images
  USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = product_images.product_id));
CREATE POLICY "Admins can update product image records" ON public.product_images
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid())));
CREATE POLICY "Admins can delete product image records" ON public.product_images
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid())));

-- Invoker privileges: the existing admin policies remain the authorization boundary.
-- One transaction prevents a failed upload/save from leaving a half-deleted gallery.
CREATE FUNCTION public.save_product_images(p_product_id uuid, p_images jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  image_row jsonb;
  position integer := 0;
  primary_position integer;
  removed_urls jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid())) THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;
  PERFORM 1 FROM public.products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Product not found'; END IF;
  IF p_images IS NULL OR jsonb_typeof(p_images) <> 'array' THEN
    RAISE EXCEPTION 'Images must be an array';
  END IF;
  IF jsonb_array_length(p_images) > 20 THEN RAISE EXCEPTION 'Maximum 20 images'; END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_images) AS image
    WHERE image->>'id' IS NULL OR image->>'image_url' IS NULL
      OR image->>'image_url' NOT LIKE
        'https://dcpiobxzphainpltnict.supabase.co/storage/v1/object/public/product-images/products/' || p_product_id::text || '/%'
  ) THEN RAISE EXCEPTION 'Invalid product image'; END IF;
  IF (SELECT count(*) FROM jsonb_array_elements(p_images)) <>
     (SELECT count(DISTINCT image->>'id') FROM jsonb_array_elements(p_images) AS image) THEN
    RAISE EXCEPTION 'Duplicate image IDs';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.product_images existing JOIN jsonb_array_elements(p_images) AS image
      ON existing.id = (image->>'id')::uuid WHERE existing.product_id <> p_product_id
  ) THEN RAISE EXCEPTION 'Image belongs to another product'; END IF;

  SELECT coalesce(jsonb_agg(image_url), '[]'::jsonb) INTO removed_urls
  FROM public.product_images existing WHERE existing.product_id = p_product_id
    AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_images) AS image WHERE image->>'image_url' = existing.image_url);
  SELECT coalesce(min(ordinality::integer) FILTER (WHERE coalesce((image->>'is_primary')::boolean, false)), 1)
    INTO primary_position FROM jsonb_array_elements(p_images) WITH ORDINALITY AS entry(image, ordinality);

  FOR image_row IN SELECT value FROM jsonb_array_elements(p_images) LOOP
    position := position + 1;
    INSERT INTO public.product_images (id, product_id, image_url, sort_order, is_primary)
    VALUES ((image_row->>'id')::uuid, p_product_id, image_row->>'image_url', position - 1, position = primary_position)
    ON CONFLICT (id) DO UPDATE SET image_url = excluded.image_url, sort_order = excluded.sort_order, is_primary = excluded.is_primary;
  END LOOP;
  DELETE FROM public.product_images existing WHERE existing.product_id = p_product_id
    AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_images) AS image WHERE (image->>'id')::uuid = existing.id);
  RETURN removed_urls;
END;
$$;
REVOKE ALL ON FUNCTION public.save_product_images(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_product_images(uuid, jsonb) TO authenticated;
