-- =====================================================
-- REVIEW TABLE FOR INVENTORY REVIEW SYSTEM
-- =====================================================
-- This SQL creates the review table for vehicle reviews
-- Execute this in Render PostgreSQL to add review functionality
-- =====================================================

-- Create review table
CREATE TABLE IF NOT EXISTS cse340.review (
  review_id SERIAL PRIMARY KEY,
  review_text TEXT NOT NULL,
  review_rating INTEGER NOT NULL CHECK (review_rating >= 1 AND review_rating <= 5),
  review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  inv_id INTEGER NOT NULL REFERENCES cse340.inventory(inv_id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES cse340.account(account_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_review_inv_id ON cse340.review(inv_id);
CREATE INDEX IF NOT EXISTS idx_review_account_id ON cse340.review(account_id);
CREATE INDEX IF NOT EXISTS idx_review_date ON cse340.review(review_date DESC);

-- Add comments for documentation
COMMENT ON TABLE cse340.review IS 'Vehicle reviews and ratings from customers';
COMMENT ON COLUMN cse340.review.review_text IS 'Text content of the review';
COMMENT ON COLUMN cse340.review.review_rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN cse340.review.inv_id IS 'Foreign key to inventory item';
COMMENT ON COLUMN cse340.review.account_id IS 'Foreign key to account (reviewer)';

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_review_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_review_updated_at ON cse340.review;
CREATE TRIGGER update_review_updated_at
BEFORE UPDATE ON cse340.review
FOR EACH ROW
EXECUTE FUNCTION update_review_updated_at_column();
