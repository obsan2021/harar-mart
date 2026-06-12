-- ============================================================
-- Fix users table to ensure all required columns exist
-- This migration ensures the users table has all columns
-- needed by the AuthContext fetchUserProfile function
-- ============================================================

-- Add is_verified column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add country column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'country'
  ) THEN
    ALTER TABLE users ADD COLUMN country TEXT;
  END IF;
END $$;

-- Update role constraint to include buyer and seller roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('customer', 'admin', 'delivery_agent', 'buyer', 'seller'));

-- Ensure the handle_new_user trigger exists and is correct
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, is_verified, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1), ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'buyer'),
    false,
    COALESCE(NEW.raw_user_meta_data ->> 'country', NULL)
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User row already exists, ignore
    RETURN NEW;
END;
$$;

-- Drop and recreate trigger to ensure it's properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: create missing user rows for existing auth users
-- who don't have a corresponding public.users row
INSERT INTO public.users (id, email, full_name, role, is_verified, country)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'full_name', split_part(au.email, '@', 1), ''),
  COALESCE(au.raw_user_meta_data ->> 'role', 'buyer'),
  false,
  COALESCE(au.raw_user_meta_data ->> 'country', NULL)
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;
