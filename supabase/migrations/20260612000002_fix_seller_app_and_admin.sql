-- ============================================================
-- Fix seller_applications: use gen_random_uuid() instead of uuid_generate_v4()
-- ============================================================
ALTER TABLE seller_applications 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================================
-- Ensure the get_my_seller_application RPC function exists
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
-- Update handle_new_user to auto-assign admin role for specific emails
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Auto-assign admin role for specific email addresses
  IF NEW.email IN ('ethiogeeksoffcial@gmail.com', 'obsanet2021@gmail.com') THEN
    v_role := 'admin';
  ELSE
    v_role := 'buyer';
  END IF;

  INSERT INTO public.users (id, email, full_name, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    v_role,
    v_role = 'admin'  -- admins are auto-verified
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- Update existing users who already signed up with these emails
-- ============================================================
UPDATE users 
SET role = 'admin', is_verified = true
WHERE email IN ('ethiogeeksoffcial@gmail.com', 'obsanet2021@gmail.com')
  AND role != 'admin';
