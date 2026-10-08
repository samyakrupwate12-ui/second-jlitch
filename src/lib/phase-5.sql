-- Reference for the remotely applied phase_five_test_checkout migration.
CREATE TABLE public.checkout_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  request_id uuid NOT NULL,
  request_hash text NOT NULL,
  status text NOT NULL DEFAULT 'creating' CHECK (status IN ('creating','pending','paid')),
  is_test boolean NOT NULL DEFAULT true CHECK (is_test = true),
  currency text NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  subtotal_paise integer NOT NULL CHECK (subtotal_paise >= 100),
  shipping_paise integer NOT NULL CHECK (shipping_paise BETWEEN 0 AND 100000),
  total_paise integer NOT NULL CHECK (total_paise BETWEEN 100 AND 50000000 AND total_paise = subtotal_paise + shipping_paise),
  lines jsonb NOT NULL CHECK (jsonb_typeof(lines) = 'array' AND jsonb_array_length(lines) BETWEEN 1 AND 20),
  shipping_address jsonb NOT NULL CHECK (jsonb_typeof(shipping_address) = 'object'),
  razorpay_key_id text NOT NULL CHECK (razorpay_key_id LIKE 'rzp_test_%'),
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  UNIQUE (user_id, request_id),
  CHECK (status = 'creating' OR razorpay_order_id IS NOT NULL),
  CHECK (status <> 'paid' OR (razorpay_payment_id IS NOT NULL AND paid_at IS NOT NULL))
);
CREATE INDEX checkout_orders_user_created_idx ON public.checkout_orders (user_id, created_at DESC);
ALTER TABLE public.checkout_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.checkout_orders FROM anon, authenticated;
GRANT SELECT ON public.checkout_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkout_orders TO service_role;
CREATE POLICY "Customers can read their own checkout orders" ON public.checkout_orders
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
