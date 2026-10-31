CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  phone VARCHAR(16) UNIQUE NOT NULL,
  display_name VARCHAR(80),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price_toman BIGINT NOT NULL DEFAULT 0 CHECK (price_toman >= 0),
  city VARCHAR(80) NOT NULL,
  category VARCHAR(80) NOT NULL,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(16) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'published', 'rejected', 'sold', 'expired')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listings_public_feed_idx
  ON listings (status, is_featured DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS listings_city_category_idx
  ON listings (city, category, status);
