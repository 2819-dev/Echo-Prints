-- Structured filament inventory per printer (Company / Type / Color), replacing
-- the old free-text filaments_available blurb captured once at application time.
-- Printers manage this list themselves from their dashboard.
CREATE TABLE IF NOT EXISTS printer_filaments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_printer_filaments_user ON printer_filaments(user_id);
