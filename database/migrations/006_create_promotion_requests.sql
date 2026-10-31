CREATE TABLE IF NOT EXISTS promotion_requests (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  promotion_type VARCHAR(16) NOT NULL CHECK (promotion_type IN ('featured', 'bump')),
  status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(80),
  admin_note TEXT
);
CREATE INDEX IF NOT EXISTS promotion_requests_status_date_idx
  ON promotion_requests(status, requested_at DESC);
CREATE INDEX IF NOT EXISTS promotion_requests_user_date_idx
  ON promotion_requests(user_id, requested_at DESC);
