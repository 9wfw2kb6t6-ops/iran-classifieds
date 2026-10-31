-- Add the expired state while preserving existing listing statuses.
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check
  CHECK (status IN ('pending', 'published', 'rejected', 'sold', 'expired'));
