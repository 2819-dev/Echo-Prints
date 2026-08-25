-- Colors: optional real photo (stored as a data URL) instead of the CSS gradient swatch
ALTER TABLE colors ADD COLUMN photo_data_url TEXT;
