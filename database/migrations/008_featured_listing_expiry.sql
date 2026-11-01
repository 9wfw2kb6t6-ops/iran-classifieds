-- Give every featured listing a seven-day validity window.
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- Existing featured listings receive a fresh seven-day window when this migration is applied.
UPDATE listings
SET featured_until = NOW() + INTERVAL '7 days'
WHERE is_featured = TRUE
  AND featured_until IS NULL;

CREATE INDEX IF NOT EXISTS listings_featured_until_idx
  ON listings (featured_until)
  WHERE is_featured = TRUE;
