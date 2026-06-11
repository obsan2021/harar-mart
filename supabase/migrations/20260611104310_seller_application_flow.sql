-- Seller Application Flow
-- Everyone signs up as 'buyer', then applies to become a seller.
-- Admin reviews and approves/rejects applications.

-- ============================================================
-- 1. Create seller_applications table
-- ============================================================
CREATE TABLE IF NOT EXISTS seller_applications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name     TEXT NOT NULL,
  supplier_type    TEXT NOT NULL CHECK (supplier_type IN ('manufacturer', 'trading_company', 'wholesaler')),
  tax_id           TEXT,
  description      TEXT NOT NULL,
  website          TEXT,
  country          TEXT NOT NULL,
  phone            TEXT NOT NULL,
  business_license_url TEXT,
  certifications   TEXT[] DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note       TEXT,
  reviewed_by      UUID REFERENCES users(id),
  reviewed_at      TIMESTAMP WITH TIME ZONE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partial unique index: only one pending OR approved application per user.
-- Rejected users can reapply freely.
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_applications_active
  ON seller_applications(user_id)
  WHERE status IN ('pending', 'approved');

CREATE INDEX IF NOT EXISTS idx_seller_applications_user    ON seller_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_applications_status  ON seller_applications(status);

ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own application
CREATE POLICY "Users can view their own applications"
  ON seller_applications FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Buyers can insert their own application (only if they don't already have one pending)
CREATE POLICY "Users can submit their own application"
  ON seller_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM seller_applications
      WHERE user_id = auth.uid() AND status = 'pending'
    )
  );

-- Only admins can update applications (approve/reject)
CREATE POLICY "Only admins can update applications"
  ON seller_applications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 2. RPC: get_my_seller_application
--    Returns the most recent application for the current user.
--    Simpler than raw queries and handles the reapplication case.
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_seller_application()
RETURNS SETOF seller_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM seller_applications
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$;

-- ============================================================
-- 3. Function: approve_seller_application
--    Atomically flips role to 'seller' and creates seller_profiles row
-- ============================================================
CREATE OR REPLACE FUNCTION approve_seller_application(p_application_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id       UUID;
  v_company_name  TEXT;
  v_supplier_type TEXT;
  v_tax_id        TEXT;
  v_certifications TEXT[];
  v_license_url   TEXT;
  v_country       TEXT;
  v_phone         TEXT;
BEGIN
  -- Lock the application row to prevent race conditions
  SELECT
    user_id, company_name, supplier_type, tax_id,
    certifications, business_license_url, country, phone
  INTO
    v_user_id, v_company_name, v_supplier_type, v_tax_id,
    v_certifications, v_license_url, v_country, v_phone
  FROM seller_applications
  WHERE id = p_application_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;

  -- Update user role to seller
  UPDATE users
  SET role = 'seller', country = COALESCE(v_country, country)
  WHERE id = v_user_id;

  -- Create seller_profiles row (idempotent — won't error if already exists)
  INSERT INTO seller_profiles (user_id, company_name, tax_id, supplier_type, certifications, business_license_url, is_verified)
  VALUES (v_user_id, v_company_name, v_tax_id, v_supplier_type, v_certifications, v_license_url, true)
  ON CONFLICT (user_id) DO UPDATE SET
    company_name       = EXCLUDED.company_name,
    tax_id             = EXCLUDED.tax_id,
    supplier_type      = EXCLUDED.supplier_type,
    certifications     = EXCLUDED.certifications,
    business_license_url = EXCLUDED.business_license_url,
    is_verified        = true;

  -- Mark application as approved
  UPDATE seller_applications
  SET status = 'approved', reviewed_at = NOW(), reviewed_by = auth.uid()
  WHERE id = p_application_id;
END;
$$;

-- ============================================================
-- 4. Function: reject_seller_application
-- ============================================================
CREATE OR REPLACE FUNCTION reject_seller_application(p_application_id UUID, p_reason TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE seller_applications
  SET status = 'rejected', admin_note = p_reason, reviewed_at = NOW(), reviewed_by = auth.uid()
  WHERE id = p_application_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;
END;
$$;

-- ============================================================
-- 5. Update the handle_new_user trigger to always create 'buyer'
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'buyer',  -- Everyone starts as a buyer
    false
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 6. Add updated_at trigger for seller_applications
-- ============================================================
CREATE TRIGGER update_seller_applications_updated_at
  BEFORE UPDATE ON seller_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 7. Enforce verified seller check on product write policies
--    A user must have role='seller' AND is_verified=true to
--    insert/update/delete products. This prevents bypassing
--    the application approval process at the DB level.
-- ============================================================
-- Drop old product write policies (from the original migration)
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

-- New policies: admins OR verified sellers can write
CREATE POLICY "Admins and verified sellers can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'seller' AND is_verified = true)
  );

CREATE POLICY "Admins and verified sellers can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'seller' AND is_verified = true)
  );

CREATE POLICY "Admins and verified sellers can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'seller' AND is_verified = true)
  );
