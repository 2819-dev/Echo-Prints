-- Echo Prints core schema

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'printer', 'retailer')),
  business_name TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('retailer', 'printer')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE colors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  material TEXT NOT NULL DEFAULT 'Bambu Lab Silk Dual-Color (Swirl)',
  hex_primary TEXT NOT NULL,
  hex_secondary TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE print_jobs (
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

CREATE INDEX idx_print_jobs_status ON print_jobs(status);
CREATE INDEX idx_applications_status ON applications(status);
