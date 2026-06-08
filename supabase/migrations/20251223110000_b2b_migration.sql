-- B2B Marketplace Migration
-- Add B2B features to existing Harar Mart schema

-- Update users table for B2B
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;

-- Update role constraint to include buyer and seller
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('buyer', 'seller', 'admin'));

-- Create seller_profiles table
CREATE TABLE IF NOT EXISTS seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  tax_id TEXT,
  business_license_url TEXT,
  certifications TEXT[] DEFAULT '{}',
  supplier_type TEXT DEFAULT 'manufacturer' CHECK (supplier_type IN ('manufacturer', 'trading_company', 'wholesaler')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update products table for B2B
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES seller_profiles(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS moq INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_price DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_price DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS hs_code TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 7;
ALTER TABLE products ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';
-- Make price nullable for B2B products that use min_price/max_price
ALTER TABLE products ALTER COLUMN price DROP NOT NULL;

-- Update categories table for hierarchical structure
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  message TEXT NOT NULL,
  destination_port TEXT,
  desired_delivery_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  sample_available BOOLEAN DEFAULT FALSE,
  sample_price DECIMAL(10, 2),
  lead_time_days INTEGER,
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for B2B tables
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_verified ON seller_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_moq ON products(moq);
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer ON inquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_product ON inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_quotes_inquiry ON quotes(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_quotes_seller ON quotes(seller_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- Enable RLS on new tables
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Policies for seller_profiles
CREATE POLICY "Sellers can view their own profile" ON seller_profiles FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Sellers can insert their own profile" ON seller_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sellers can update their own profile" ON seller_profiles FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can delete seller profiles" ON seller_profiles FOR DELETE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Policies for inquiries
CREATE POLICY "Buyers can view their own inquiries" ON inquiries FOR SELECT USING (auth.uid() = buyer_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Sellers can view inquiries for their products" ON inquiries FOR SELECT USING (EXISTS (SELECT 1 FROM products WHERE products.id = inquiries.product_id AND products.seller_id IN (SELECT id FROM seller_profiles WHERE user_id = auth.uid())));
CREATE POLICY "Buyers can create inquiries" ON inquiries FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers can update their own inquiries" ON inquiries FOR UPDATE USING (auth.uid() = buyer_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Policies for quotes
CREATE POLICY "Sellers can view their own quotes" ON quotes FOR SELECT USING (auth.uid() IN (SELECT user_id FROM seller_profiles WHERE id = quotes.seller_id) OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Buyers can view quotes for their inquiries" ON quotes FOR SELECT USING (EXISTS (SELECT 1 FROM inquiries WHERE inquiries.id = quotes.inquiry_id AND inquiries.buyer_id = auth.uid()));
CREATE POLICY "Sellers can create quotes" ON quotes FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM seller_profiles WHERE id = quotes.seller_id));
CREATE POLICY "Sellers can update their own quotes" ON quotes FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM seller_profiles WHERE id = quotes.seller_id));

-- Update product policies to allow sellers to manage their products
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
CREATE POLICY "Sellers can insert their own products" ON products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM seller_profiles WHERE id = products.seller_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Only admins can update products" ON products;
CREATE POLICY "Sellers can update their own products" ON products FOR UPDATE USING (EXISTS (SELECT 1 FROM seller_profiles WHERE id = products.seller_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Only admins can delete products" ON products;
CREATE POLICY "Sellers can delete their own products" ON products FOR DELETE USING (EXISTS (SELECT 1 FROM seller_profiles WHERE id = products.seller_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Insert B2B categories
INSERT INTO categories (name, description, parent_id) VALUES
  ('Electronics', 'Electronic components and devices', NULL),
  ('Machinery', 'Industrial machinery and equipment', NULL),
  ('Apparel & Textiles', 'Clothing and textile products', NULL),
  ('Chemicals', 'Industrial and agricultural chemicals', NULL),
  ('Home & Garden', 'Home appliances and garden supplies', NULL),
  ('Consumer Electronics', 'Phones, computers, and accessories', (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1)),
  ('Industrial Machinery', 'Manufacturing and construction equipment', (SELECT id FROM categories WHERE name = 'Machinery' LIMIT 1)),
  ('Clothing', 'Men, women, and children clothing', (SELECT id FROM categories WHERE name = 'Apparel & Textiles' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample B2B seller
INSERT INTO users (email, password_hash, full_name, role, country, is_verified) VALUES
  ('seller@example.com', '$2a$10$placeholder_hash', 'Global Trading Co', 'seller', 'China', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert sample seller profile
INSERT INTO seller_profiles (user_id, company_name, tax_id, supplier_type, certifications, is_verified)
SELECT 
  id, 
  'Global Trading Co Ltd', 
  'CN123456789', 
  'manufacturer', 
  ARRAY['ISO9001', 'CE'], 
  TRUE
FROM users 
WHERE email = 'seller@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample B2B products
INSERT INTO products (name, description, moq, min_price, max_price, seller_id, category_id, images, hs_code, lead_time_days, certifications)
SELECT 
  'Wireless Bluetooth Earbuds',
  'High-quality wireless earbuds with noise cancellation',
  100,
  5.00,
  8.00,
  (SELECT id FROM seller_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'seller@example.com')),
  (SELECT id FROM categories WHERE name = 'Consumer Electronics' LIMIT 1),
  ARRAY['/images/earbuds1.jpg', '/images/earbuds2.jpg'],
  '85263090',
  14,
  ARRAY['CE', 'FCC']
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, moq, min_price, max_price, seller_id, category_id, images, hs_code, lead_time_days, certifications)
SELECT 
  'Industrial Conveyor Belt',
  'Heavy-duty conveyor belt for manufacturing',
  50,
  150.00,
  250.00,
  (SELECT id FROM seller_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'seller@example.com')),
  (SELECT id FROM categories WHERE name = 'Industrial Machinery' LIMIT 1),
  ARRAY['/images/conveyor1.jpg'],
  '40101200',
  30,
  ARRAY['ISO9001']
ON CONFLICT DO NOTHING;
