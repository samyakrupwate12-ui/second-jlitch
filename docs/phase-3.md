# Customer accounts, wishlist, and cart

Phase 3 replaces the account, wishlist, and cart demos with Supabase Auth and saved shopping selections. Checkout and payments are not enabled yet.

- Guests store product IDs and quantities in browser storage.
- Signed-in users store selections in `public.customer_items`. RLS limits all operations to the current user and checks catalogue visibility and stock for cart writes.
- Signing in imports valid guest selections. Existing account entries win if both contain the same product. Signing out clears account selections from the screen.
- Prices and availability are loaded from `products`; the cart does not reserve stock. Checkout must revalidate price and reserve inventory when implemented.

## Run locally

Keep the existing `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never use a service-role key in client code.

```sh
npm ci
npm run dev
```

The customer table was applied to the connected Supabase project through the `customer_wishlist_and_cart` migration. `src/lib/customer-items.sql` records that schema for review; do not run it again on the same project.

## Auth email setup

In Supabase Auth URL Configuration, set Site URL to the production site and allow both `/account` and `/account?reset=1` on the production origin. For local development, allow `http://localhost:3000/account` and `http://localhost:3000/account?reset=1`. Confirmation email links return to the account page; recovery links return to the new-password form. Configure production SMTP before accepting public sign-ups if the default email service is restricted.

Email/password sign-ups and confirmation are enabled in the connected project. Real confirmation/reset email delivery and the redirect allowlist still require verification with a real inbox; automated tests do not send emails.

## Validation

```sh
npm test
npm run build
```

Tests run the real React provider and account forms in jsdom with a simulated Auth/Data API: guest persistence, one-of-one quantities, import on sign-in, save failures, logout isolation, sign-up confirmation, invalid login, profile edits, and password recovery after refresh. Database RLS was independently checked with rolled-back SQL under two authenticated user identities plus `anon`.

Manual release checks: save a heart, open Wishlist, add a piece to the bag, refresh, change quantity, sign in, sign out, and verify the previous account's items are no longer shown. Repeat on a phone. Complete a real sign-up confirmation and password-reset email round trip.
