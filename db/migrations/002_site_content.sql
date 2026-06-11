-- Contenido público del sitio (textos, configuración editorial)

CREATE TABLE IF NOT EXISTS site_content (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  meta VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  src VARCHAR(500) NOT NULL,
  alt VARCHAR(500) NOT NULL,
  layout_size VARCHAR(50) NOT NULL DEFAULT 'grid',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  piece VARCHAR(255) NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_date VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  image VARCHAR(500) NOT NULL,
  image_alt VARCHAR(500) NOT NULL,
  client_phone VARCHAR(50),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_published ON portfolio_items (is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews (is_published, sort_order);
