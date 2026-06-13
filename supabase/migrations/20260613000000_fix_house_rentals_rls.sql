-- Fix House Rentals RLS policies + Storage bucket setup
-- 
-- PROBLEM 1: The house_rentals SELECT policy was too restrictive:
--   "Anyone can view available rentals" USING (status = 'available' OR auth.uid() = user_id)
--   This prevented public/unauthenticated users from seeing any listings,
--   and also hid 'rented' listings from everyone except the owner.
--
-- PROBLEM 2: The users table SELECT policy blocks the join:
--   "Users can view their own data" USING (auth.uid() = id)
--   When HouseRentals.tsx does .select('*, user:users(*)'), the join to users
--   fails because RLS on users only allows seeing your own row.
--   This causes the entire query to return empty or error.
--
-- PROBLEM 3: The "house-images" storage bucket doesn't exist.
--   ImageUpload.tsx calls supabase.storage.from('house-images').upload(...)
--   which fails with "bucket not found".
--
-- FIX: 
--   1. Allow public read access to all house_rentals listings
--   2. Allow public read access to users table so the join works
--   3. Create the "house-images" storage bucket with public read access
--
-- NOTE: All CREATE POLICY statements are preceded by DROP POLICY IF EXISTS
-- to make this migration fully idempotent (safe to run multiple times).

-- ============================================================
-- Fix 1: house_rentals policies
-- ============================================================

-- Drop old policies (both old and new names for idempotency)
DROP POLICY IF EXISTS "Anyone can view available rentals" ON house_rentals;
DROP POLICY IF EXISTS "Anyone can view listings" ON house_rentals;

-- Allow anyone (including unauthenticated) to view all listings
CREATE POLICY "Anyone can view listings"
  ON house_rentals FOR SELECT
  TO public
  USING (true);

-- Ensure the INSERT policy allows authenticated users to insert with their user_id
DROP POLICY IF EXISTS "Users can insert their own listings" ON house_rentals;
CREATE POLICY "Users can insert their own listings"
  ON house_rentals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure owners can update their own listings
DROP POLICY IF EXISTS "Owners can update their own listings" ON house_rentals;
CREATE POLICY "Owners can update their own listings"
  ON house_rentals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure owners can delete their own listings
DROP POLICY IF EXISTS "Owners can delete their own listings" ON house_rentals;
CREATE POLICY "Owners can delete their own listings"
  ON house_rentals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- Fix 2: users table policy - allow public read for join to work
-- ============================================================

-- Drop old policies (both old and new names for idempotency)
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Anyone can view user profiles" ON users;

-- Allow anyone to view user profiles (needed for joins like house_rentals -> users)
-- Only exposes: id, email, full_name, phone, address, role, is_verified, country, created_at
-- Password_hash is no longer stored in this table (Supabase Auth handles passwords)
CREATE POLICY "Anyone can view user profiles"
  ON users FOR SELECT
  TO public
  USING (true);

-- ============================================================
-- Fix 3: Create "house-images" storage bucket
-- ============================================================

-- Insert the bucket into storage.buckets
-- The id and name must both be 'house-images' to match the code
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'house-images',
  'house-images',
  true,               -- public bucket (anyone can read)
  5242880,            -- 5 MB file size limit
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[];

-- Allow public read access to objects in house-images
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'house-images');

-- Allow authenticated users to upload to house-images
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'house-images');

-- Allow users to update/delete their own uploads
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'house-images' AND auth.uid()::text = storage.objects.owner::text);

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'house-images' AND auth.uid()::text = storage.objects.owner::text);
