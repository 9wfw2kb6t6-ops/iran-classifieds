CREATE TABLE IF NOT EXISTS wallet_topup_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_code VARCHAR(24) NOT NULL,
  amount_toman BIGINT NOT NULL CHECK (amount_toman > 0),
  status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  admin_note TEXT
);
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_toman BIGINT NOT NULL CHECK (amount_toman <> 0),
  transaction_type VARCHAR(24) NOT NULL CHECK (transaction_type IN ('topup','promotion','refund','adjustment')),
  description VARCHAR(240) NOT NULL,
  reference_type VARCHAR(32),
  reference_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS wallet_topup_user_date_idx ON wallet_topup_requests(user_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS wallet_topup_status_date_idx ON wallet_topup_requests(status, requested_at ASC);
CREATE INDEX IF NOT EXISTS wallet_transactions_user_date_idx ON wallet_transactions(user_id, created_at DESC);
