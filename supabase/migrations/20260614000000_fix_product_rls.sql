-- Fix RLS: sellers can only modify their OWN products
-- Previously, policies checked only "is the user a verified seller?"
-- without scoping to the seller's own products.

DROP POLICY IF EXISTS "Admins and verified sellers can insert products" ON products;
DROP POLICY IF EXISTS "Admins and verified sellers can update products" ON products;
DROP POLICY IF EXISTS "Admins and verified sellers can delete products" ON products;
DROP POLICY IF EXISTS "Sellers can insert their own products" ON products;
DROP POLICY IF EXISTS "Sellers can update their own products" ON products;
DROP POLICY IF EXISTS "Sellers can delete their own products" ON products;

-- INSERT: seller_id in the new row must belong to the logged-in user
CREATE POLICY "Sellers can insert their own products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seller_profiles
      WHERE seller_profiles.id = products.seller_id
        AND seller_profiles.user_id = auth.uid()
        AND seller_profiles.is_verified = true
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- UPDATE: can only touch rows where seller_id belongs to you
CREATE POLICY "Sellers can update their own products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM seller_profiles
      WHERE seller_profiles.id = products.seller_id
        AND seller_profiles.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- DELETE: same scoping
CREATE POLICY "Sellers can delete their own products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM seller_profiles
      WHERE seller_profiles.id = products.seller_id
        AND seller_profiles.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
