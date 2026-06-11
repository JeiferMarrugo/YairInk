-- Bloqueos de calendario (días/horarios no disponibles)

CREATE TABLE IF NOT EXISTS calendar_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason VARCHAR(255),
  all_day BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT calendar_blocks_range CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_calendar_blocks_starts_at ON calendar_blocks (starts_at);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_ends_at ON calendar_blocks (ends_at);
