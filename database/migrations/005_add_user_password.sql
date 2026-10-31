ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
CREATE INDEX IF NOT EXISTS listings_user_created_idx ON listings(user_id, created_at DESC);