-- Admin/printer-only link to the model file (e.g. a MakerWorld.com page or
-- a direct .stl/.3mf URL). Never shown on the public shop pages.
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_url TEXT;
