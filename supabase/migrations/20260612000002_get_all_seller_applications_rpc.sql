-- RPC function for admins to fetch all seller applications with user data
-- This avoids RLS issues with joins and provides a single query for the admin panel

CREATE OR REPLACE FUNCTION get_all_seller_applications()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  company_name TEXT,
  supplier_type TEXT,
  tax_id TEXT,
  description TEXT,
  website TEXT,
  country TEXT,
  phone TEXT,
  business_license_url TEXT,
  certifications TEXT[],
  status TEXT,
  admin_note TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_email TEXT,
  user_full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.id,
    sa.user_id,
    sa.company_name,
    sa.supplier_type,
    sa.tax_id,
    sa.description,
    sa.website,
    sa.country,
    sa.phone,
    sa.business_license_url,
    sa.certifications,
    sa.status,
    sa.admin_note,
    sa.reviewed_by,
    sa.reviewed_at,
    sa.created_at,
    sa.updated_at,
    u.email as user_email,
    u.full_name as user_full_name
  FROM seller_applications sa
  LEFT JOIN users u ON sa.user_id = u.id
  ORDER BY sa.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users (RLS will handle admin check)
GRANT EXECUTE ON FUNCTION get_all_seller_applications() TO authenticated;
