-- Citas y clientes — campos para agenda admin

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS style VARCHAR(255),
  ADD COLUMN IF NOT EXISTS placement VARCHAR(255);

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS concept TEXT,
  ADD COLUMN IF NOT EXISTS placement VARCHAR(255),
  ADD COLUMN IF NOT EXISTS size_estimate VARCHAR(100),
  ADD COLUMN IF NOT EXISTS style VARCHAR(255),
  ADD COLUMN IF NOT EXISTS notes TEXT;

UPDATE appointments SET status = 'pending' WHERE status = 'scheduled';

ALTER TABLE appointments
  ALTER COLUMN status SET DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments (client_id);
