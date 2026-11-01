ALTER TABLE store_builder_requests
  ADD COLUMN IF NOT EXISTS prepayment_amount_toman BIGINT,
  ADD COLUMN IF NOT EXISTS prepayment_confirmed_at TIMESTAMPTZ;

ALTER TABLE store_builder_requests
  DROP CONSTRAINT IF EXISTS store_builder_requests_status_check;

UPDATE store_builder_requests
SET status = 'deposit_confirmed'
WHERE status = 'paid';

ALTER TABLE store_builder_requests
  ADD CONSTRAINT store_builder_requests_status_check
  CHECK (status IN (
    'pending','contacted','quoted','awaiting_deposit','deposit_confirmed',
    'building','customer_review','revision','delivered','rejected'
  ));
