CREATE TABLE IF NOT EXISTS listing_reports (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reason VARCHAR(40) NOT NULL CHECK (reason IN ('fraud', 'wrong_info', 'prohibited', 'duplicate', 'other')),
  details VARCHAR(1500),
  reporter_contact VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS listing_reports_status_created_idx ON listing_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS listing_reports_listing_id_idx ON listing_reports(listing_id);