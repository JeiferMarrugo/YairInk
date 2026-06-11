-- Fotos de artista, citas realizadas y reseñas vinculadas a sesiones

ALTER TABLE artists
  ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS share_token VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS session_photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS portfolio_item_id UUID REFERENCES portfolio_items(id) ON DELETE SET NULL;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_share_token ON appointments (share_token);
CREATE INDEX IF NOT EXISTS idx_reviews_appointment_id ON reviews (appointment_id);
