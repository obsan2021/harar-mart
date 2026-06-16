-- Fix infinite recursion in users table RLS
-- The "Admins can view all users" policy does a recursive subquery
-- that causes infinite recursion when seller_profiles joins to users.
-- Solution: Drop the recursive admin policy and use a simpler approach.
-- The "Anyone can view basic user info" policy (USING true) already exists
-- and allows public reads. For admin-specific operations, we use SECURITY DEFINER
-- functions instead.

DROP POLICY IF EXISTS "Admins can view all users" ON users;
