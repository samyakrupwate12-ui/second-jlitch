# Phase 4: catalogue, images and inventory

## Customer catalogue

Shop and Pre-Loved share the existing sky design and working search/filter controls. Search includes name, brand, category, colour and material. Categories and sizes come from actual inventory. Customers can filter condition, collection and in-stock pieces, or sort by price. Newest remains the default. Catalogue and detail errors offer a retry; they are not shown as an empty collection. Returning focus refreshes catalogue and detail availability. The featured homepage section prioritizes explicitly featured products.

Products without photos use a neutral “Photo coming soon” placeholder. Draft, archived and hidden products are excluded by database RLS, even through direct API requests. Their image records also follow product visibility. Previously shared public Storage URLs remain public: catalogue hiding is not access revocation for the image bytes.

## Admin images

Admins can upload JPG, PNG and WEBP files up to 10 MB each, with a maximum of 20 photos per gallery. Controls work on touch screens and keyboard focus. Reordering, primary selection and image removal commit in one database transaction using `save_product_images`, with SECURITY INVOKER and an explicit admin check. Ordinary customers cannot call it successfully or update/delete image records. Product image UPDATE/DELETE policies are admin-only; existing Storage permissions are unchanged.

Uploads use unique paths and do not overwrite files. The app uploads all new files before replacing gallery records; a failed database transaction preserves the old gallery. Removed photos are cleaned through the Storage API after the database save. Product deletion uses its existing foreign-key cascade before storage cleanup.

Product fields and Storage uploads are separate from the gallery transaction. A partial save is reported explicitly and preserves the new product ID so retrying does not create another product. Reload the saved product after a lost connection before retrying. An ambiguous RPC response can leave unused uploaded files; the app deliberately does not delete files that a committed transaction may reference. A storage-cleanup failure is reported, not hidden behind a success message.

## Inventory

Stock must be a non-negative whole number. Reducing an active item to zero marks it sold; restocking a sold item makes it active. Drafts and archived items keep their status at any stock level. Visibility is independent. Updates that affect zero rows are reported as failures. These controls do not reserve stock; checkout reservation belongs to the payment phase.

## Database and validation

`src/lib/phase-4.sql` records the already-applied remote migration `phase_four_catalogue_images`. Do not reapply it on the connected project.

Validation: `npm test`, TypeScript, production build, and rollback-only database checks under admin, customer and anonymous roles. Database checks cover gallery insert/reorder/primary/remove, preservation on failed save, hidden admin access, visible sold items, draft exclusion and denied customer writes. No real product was modified by the SQL checks. Real authenticated browser upload/removal and mobile visual checks still require an admin session.

The database advisor reports no new issue from this migration. Existing advisories remain for the public `is_admin` SECURITY DEFINER helper and disabled leaked-password protection; track these in the launch security phase:
- https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Local update (Windows Command Prompt)

Stop the development server first. Preserve or commit any local edits before pulling; resolve any reported conflict before continuing.

```bat
git pull --ff-only origin main
npm ci
if exist .next rmdir /s /q .next
npm run dev -- --webpack
```

Before moving to checkout, upload two photos to a test draft, save, reorder them, change the primary photo, remove one, save and reload. Verify draft/hidden items do not appear in a signed-out catalogue. Check an active piece at stock 1 and 0 and confirm Add to Bag respects availability.
