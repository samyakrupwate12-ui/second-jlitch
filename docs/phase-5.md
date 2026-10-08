# Phase 5: checkout and Razorpay test integration

## What is implemented

- Cart → signed-in checkout → delivery address → current-price review → Razorpay Standard Checkout → order status.
- Amounts are calculated in integer paise from server-read products. Submitted prices are ignored; hidden, sold or insufficient-stock items are rejected. The final total must match the total the customer reviewed.
- India-only address validation, prepaid payment, and a configurable flat shipping charge. PIN validation checks format, not courier serviceability; Shiprocket integration is a later phase.
- Server authentication verifies the bearer token with Supabase `getUser`. The browser never receives a privileged Supabase key or the Razorpay key secret.
- The order is stored before contacting Razorpay. A per-user request ID prevents duplicate provider calls on retry. Only a SHA-256 payload fingerprint and random request ID are stored in browser session storage; the delivery address is not persisted there.
- Razorpay signatures use the order ID from our database. Payment confirmation additionally checks the provider's order and payment IDs, currency, amount, captured status and refund amount. Authorized-only payments remain pending.
- Returning to an order and selecting “Check payment status” recovers a missing browser callback using authenticated provider API checks. Verification is idempotent.
- Customer order reads are protected by owner RLS. Browser roles have no INSERT, UPDATE or DELETE grants. Only the server creates orders and marks payments confirmed.

## Test only — live payments are blocked in code

Phase 6 still needs atomic inventory reservations, expiry/release, signed webhooks, durable reconciliation and refund handling. Therefore Phase 5 accepts only `rzp_test_` credentials and `is_test = true` database rows. Test payments do not reduce real inventory, clear the shopping bag, create shipments or appear in the placeholder admin orders dashboard. Merely replacing the key with a live key will disable payments.

Recent checkouts are available at `/checkout/orders`. When an external order creation request times out, its database row stays `creating`. It is intentionally not retried with a fresh provider order: the response may have been lost after provider creation. Reconcile its UUID receipt in the Razorpay test dashboard before another attempt. Automated reconciliation is a Phase 6 requirement.

## Private environment configuration

Add these values to the SECOND JLITCH Vercel project under Settings → Environment Variables, then redeploy. For local testing, put the same values in `.env.local` and restart the development server. Do not commit values, paste secrets into chat, or prefix any of these names with `NEXT_PUBLIC_`.

| Name | Value |
| --- | --- |
| `ENABLE_TEST_CHECKOUT` | `true` |
| `RAZORPAY_KEY_ID` | Your Razorpay **test** key ID beginning `rzp_test_` |
| `RAZORPAY_KEY_SECRET` | Secret paired with that test key |
| `SUPABASE_SECRET_KEY` | Backend secret key for the existing Supabase project; a legacy service-role key may instead be stored as `SUPABASE_SERVICE_ROLE_KEY` |
| `CHECKOUT_SHIPPING_PAISE` | Your chosen flat fee, as a whole number of paise. `5000` means ₹50; `0` explicitly means free shipping. No shipping fee is assumed. |

The existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` stay unchanged. No additional npm dependency is required. In Razorpay's **test mode**, configure automatic payment capture; an authorized but uncaptured payment will not show as confirmed.

`src/lib/phase-5.sql` records the remotely applied `phase_five_test_checkout` migration. Do not reapply it to this project. It adds `checkout_orders`; it does not change products, stock, storage or customer cart policies.

## Validation and remaining acceptance test

Automated checks exercise input validation, paise precision, server pricing, hidden/sold/stock restrictions, missing configuration, live-key rejection, authentication, owner isolation, idempotent order creation, ambiguous timeouts, forged signatures, captured-only verification and repeated confirmation. SQL checks use rolled-back fixtures to verify owner-only reads and denied browser writes. No real customer order or payment is created by automated tests.

Real Razorpay requests cannot be tested until credentials are configured. After configuration:

1. Sign in and add an available piece. Review an Indian delivery address and verify product total plus your chosen shipping fee.
2. Use Razorpay's documented test payment details. Confirm that the order page says **Test payment confirmed** and the amount matches Razorpay's test dashboard.
3. Close the payment window; check status and retry. Confirm retries reuse the order.
4. Simulate payment failure, then retry. Refresh after completing a payment and use **Check payment status**.
5. Verify another signed-in account cannot view the order and an anonymous request cannot read orders.
6. Confirm product stock and the real cart remain unchanged. Complete Phase 6 before enabling real purchases.

Existing Supabase launch advisories are unchanged: public `is_admin()` SECURITY DEFINER execution and disabled leaked-password protection (see Phase 4 notes). No new security-advisor finding was introduced.

## References

- https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps
- https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/best-practices
- https://razorpay.com/docs/api/orders/create/
- https://razorpay.com/docs/api/payments/fetch-with-id
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/reference/javascript/auth-getuser
