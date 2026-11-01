-- Extend the store-builder workflow while preserving all existing request statuses.
ALTER TABLE store_builder_requests
  DROP CONSTRAINT IF EXISTS store_builder_requests_status_check;

ALTER TABLE store_builder_requests
  ADD CONSTRAINT store_builder_requests_status_check
  CHECK (status IN (
    'pending',
    'contacted',
    'quoted',
    'pending_deposit',
    'deposit_confirmed',
    'paid',
    'building',
    'customer_review',
    'revision',
    'delivered',
    'rejected'
  ));
