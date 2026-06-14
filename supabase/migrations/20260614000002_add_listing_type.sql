-- Add listing_type column to house_rentals
ALTER TABLE house_rentals 
ADD COLUMN IF NOT EXISTS listing_type text NOT NULL DEFAULT 'rent' 
CHECK (listing_type IN ('rent', 'sale'));
