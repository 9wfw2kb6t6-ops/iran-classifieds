-- سه‌سوته: add seller contact number to listings
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS contact_phone TEXT;
