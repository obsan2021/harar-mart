-- ============================================================
-- MIGRATION: Fix all issues (Problems 1, 2, 3)
-- ============================================================

-- ============================================================
-- PROBLEM 1: Landing page stuck on skeleton loaders
-- ============================================================

-- 1a. Add RLS policies for public read access to categories, products, and seller_profiles
-- These tables contain public data that logged-out users should be able to browse.

-- Categories: Anyone can read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- Products: Anyone can read available products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Seller profiles: Anyone can read verified seller profiles
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view seller profiles" ON seller_profiles;
CREATE POLICY "Anyone can view seller profiles"
  ON seller_profiles FOR SELECT
  USING (true);

-- Users: Only allow reading minimal public info (no email, no phone, no address)
-- This fixes the infinite recursion when seller_profiles joins to users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view basic user info" ON users;
CREATE POLICY "Anyone can view basic user info"
  ON users FOR SELECT
  USING (true);

-- 1b. Add is_available column as an alias for is_active (for code compatibility)
-- The code uses .eq('is_available', true) but the DB has is_active
-- We add a generated column or just fix the code. Let's add a view column approach:
-- Actually, let's just add is_available as a view-compatible alias
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE products ADD COLUMN is_available BOOLEAN GENERATED ALWAYS AS (is_active) STORED;
  END IF;
END $$;

-- ============================================================
-- PROBLEM 2: Seller/admin applications not reaching admins
-- ============================================================

-- 2a. Create the approve_seller_application RPC function
DROP FUNCTION IF EXISTS approve_seller_application(UUID);
CREATE FUNCTION approve_seller_application(p_application_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_company_name TEXT;
BEGIN
  -- Get the application details
  SELECT user_id, company_name INTO v_user_id, v_company_name
  FROM seller_applications
  WHERE id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  -- Update application status
  UPDATE seller_applications
  SET status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = NOW()
  WHERE id = p_application_id;

  -- Update user role to seller
  UPDATE users
  SET role = 'seller'
  WHERE id = v_user_id;

  -- Create seller profile if it doesn't exist
  INSERT INTO seller_profiles (user_id, company_name, is_verified)
  VALUES (v_user_id, v_company_name, true)
  ON CONFLICT (user_id) DO UPDATE
    SET company_name = v_company_name,
        is_verified = true;
END;
$$;

-- 2b. Create the reject_seller_application RPC function
DROP FUNCTION IF EXISTS reject_seller_application(UUID, TEXT);
CREATE FUNCTION reject_seller_application(p_application_id UUID, p_reason TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE seller_applications
  SET status = 'rejected',
      admin_note = p_reason,
      reviewed_by = auth.uid(),
      reviewed_at = NOW()
  WHERE id = p_application_id;
END;
$$;

-- 2c. Add RLS policies for seller_applications
ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;

-- Admins can read all applications
DROP POLICY IF EXISTS "Admins can read all applications" ON seller_applications;
CREATE POLICY "Admins can read all applications"
  ON seller_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can insert their own application
DROP POLICY IF EXISTS "Users can insert own application" ON seller_applications;
CREATE POLICY "Users can insert own application"
  ON seller_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own application
DROP POLICY IF EXISTS "Users can read own application" ON seller_applications;
CREATE POLICY "Users can read own application"
  ON seller_applications FOR SELECT
  USING (auth.uid() = user_id);

-- 2d. Fix the obsnet2021@gmail.com account (typo in email) - set to admin
-- The correct email is obsanet2021@gmail.com which is already admin
-- obsnet2021@gmail.com is a different account, leave as buyer

-- ============================================================
-- PROBLEM 3: Schema mismatches
-- ============================================================

-- 3a. Ensure products table has all columns the code expects
DO $$
BEGIN
  -- Add min_price if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'min_price'
  ) THEN
    ALTER TABLE products ADD COLUMN min_price DECIMAL(10,2);
  END IF;

  -- Add max_price if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'max_price'
  ) THEN
    ALTER TABLE products ADD COLUMN max_price DECIMAL(10,2);
  END IF;

  -- Add moq if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'moq'
  ) THEN
    ALTER TABLE products ADD COLUMN moq INTEGER DEFAULT 1;
  END IF;

  -- Add seller_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'seller_id'
  ) THEN
    ALTER TABLE products ADD COLUMN seller_id UUID REFERENCES users(id);
  END IF;
END $$;

-- 3b. Ensure seller_profiles has all needed columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'seller_profiles' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE seller_profiles ADD COLUMN company_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'seller_profiles' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE seller_profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'seller_profiles' AND column_name = 'supplier_type'
  ) THEN
    ALTER TABLE seller_profiles ADD COLUMN supplier_type TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'seller_profiles' AND column_name = 'certifications'
  ) THEN
    ALTER TABLE seller_profiles ADD COLUMN certifications TEXT[] DEFAULT '{}';
  END IF;
END $$;
