ALTER TABLE store_builder_requests
  ADD COLUMN IF NOT EXISTS customer_feedback TEXT,
  ADD COLUMN IF NOT EXISTS customer_approved_at TIMESTAMPTZ;

ALTER TABLE store_builder_requests
  DROP CONSTRAINT IF EXISTS store_builder_requests_status_check;

ALTER TABLE store_builder_requests
  ADD CONSTRAINT store_builder_requests_status_check
  CHECK (status IN (
    'pending','contacted','quoted','awaiting_deposit','deposit_confirmed',
    'paid','building','customer_review','revision','delivered','rejected'
  ));
