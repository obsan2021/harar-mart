-- Add contact fields to house_rentals
ALTER TABLE house_rentals
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_type TEXT DEFAULT 'owner' 
    CHECK (contact_type IN ('owner', 'broker', 'agent'));

-- Reviews table
CREATE TABLE IF NOT EXISTS house_rental_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id   UUID NOT NULL REFERENCES house_rentals(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (rental_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_house_reviews_rental ON house_rental_reviews(rental_id);

ALTER TABLE house_rental_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
  ON house_rental_reviews FOR SELECT USING (true);

-- Authenticated users can insert their own review (one per listing)
CREATE POLICY "Users can insert one review per listing"
  ON house_rental_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own review
CREATE POLICY "Users can update their own review"
  ON house_rental_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own review
CREATE POLICY "Users can delete their own review"
  ON house_rental_reviews FOR DELETE
  USING (auth.uid() = user_id);
