-- Echo Prints — full database schema.
-- Safe to run this whole file anytime, on any state of the database:
-- every statement either creates something only if it's missing, or
-- updates a fixed value. It will never duplicate data or wipe anything
-- you've added through the admin panel.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'printer', 'retailer')),
  business_name TEXT,
  address TEXT,
  phone TEXT,
  printers_owned TEXT,
  filaments_available TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS printers_owned TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS filaments_available TEXT;

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('retailer', 'printer')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  address TEXT,
  printers_owned TEXT,
  filaments_available TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS printers_owned TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS filaments_available TEXT;
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE TABLE IF NOT EXISTS colors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  material TEXT NOT NULL DEFAULT '',
  hex_primary TEXT NOT NULL,
  hex_secondary TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  photo_data_url TEXT
);
ALTER TABLE colors ADD COLUMN IF NOT EXISTS photo_data_url TEXT;

CREATE TABLE IF NOT EXISTS print_jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  quantity_needed INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'printed', 'fulfilled')),
  claimed_by INTEGER REFERENCES users(id),
  claimed_at TIMESTAMP,
  printed_at TIMESTAMP,
  fulfillment_method TEXT CHECK (fulfillment_method IN ('retailer_dropoff', 'echo_pickup')),
  fulfillment_retailer_id INTEGER REFERENCES users(id),
  fulfilled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Admin login: updates it if an admin already exists, creates one if not.
-- Change the password anytime from /account once logged in.
UPDATE users
SET email = 'hf@bighappysmiely.com',
    password_hash = '$2a$10$2Ufm841TyUce2vSUrZmpzO2Rol4Qqw44gRJZyBozvxl3nbgobLEcS'
WHERE role = 'admin';

INSERT INTO users (email, password_hash, name, role)
SELECT 'hf@bighappysmiely.com', '$2a$10$2Ufm841TyUce2vSUrZmpzO2Rol4Qqw44gRJZyBozvxl3nbgobLEcS', 'Admin', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin');

-- Starter color catalog — only seeds if the colors table is currently empty,
-- so it won't touch anything you've added or edited from /admin.
INSERT INTO colors (name, material, hex_primary, hex_secondary, in_stock, sort_order)
SELECT * FROM (VALUES
  ('Gilded Rose', '', '#c9a86a', '#b5495b', TRUE, 1),
  ('Blue Hawaii', '', '#1f8fc4', '#12c48f', TRUE, 2),
  ('Neon City', '', '#ff2d95', '#00e5ff', TRUE, 3),
  ('Black Gold', '', '#151515', '#d4af37', TRUE, 4),
  ('Violet Purple', '', '#6a3ec1', '#b388ff', FALSE, 5),
  ('Grey Green', '', '#7a8b7f', '#3f4f43', TRUE, 6)
) AS seed(name, material, hex_primary, hex_secondary, in_stock, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM colors);
