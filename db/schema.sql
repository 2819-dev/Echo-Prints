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
  role TEXT NOT NULL CHECK (role IN ('admin', 'printer', 'retailer', 'customer')),
  business_name TEXT,
  address TEXT,
  phone TEXT,
  printers_owned TEXT,
  filaments_available TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS printers_owned TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS filaments_available TEXT;
-- Allow customer accounts (self-serve signup, no admin approval needed).
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'printer', 'retailer', 'customer'));

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

-- Real self-hosted shop: admin-managed product catalog, multi-photo products,
-- orders (cash now, card/Stripe slot for later), and custom "request a quote" items.

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2), -- NULL = custom / quote-only item, no fixed price
  category TEXT,
  tag TEXT CHECK (tag IN ('customizable', 'discontinued', 'limited_edition')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  allow_multi_color BOOLEAN NOT NULL DEFAULT FALSE,
  model_url TEXT, -- admin/printer-only link to the model file (MakerWorld, etc.) — never shown publicly
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tag TEXT CHECK (tag IN ('customizable', 'discontinued', 'limited_edition'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS allow_multi_color BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_url TEXT;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

CREATE TABLE IF NOT EXISTS product_photos (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  data_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_product_photos_product ON product_photos(product_id);

-- Which colors (from the color catalog) are offered for each product.
-- allow_multi_color on the product controls whether shoppers can pick
-- more than one (for AMS multi-color prints) or just a single color.
CREATE TABLE IF NOT EXISTS product_colors (
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id INTEGER NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, color_id)
);
CREATE INDEX IF NOT EXISTS idx_product_colors_product ON product_colors(product_id);

CREATE TABLE IF NOT EXISTS shop_orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- NULL = guest checkout, no account
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_user ON shop_orders(user_id);

CREATE TABLE IF NOT EXISTS shop_order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  colors TEXT -- comma-separated color names the customer chose, if any
);
ALTER TABLE shop_order_items ADD COLUMN IF NOT EXISTS colors TEXT;
CREATE INDEX IF NOT EXISTS idx_shop_order_items_order ON shop_order_items(order_id);

-- Request-a-quote submissions for custom (no fixed price) products.
CREATE TABLE IF NOT EXISTS custom_requests (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'quoted', 'closed')),
  quoted_price NUMERIC(10, 2),
  admin_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);

-- Admin login: updates it if an admin already exists, creates one if not.
-- Change the password anytime from /account once logged in.
UPDATE users
SET email = 'hf@bighappysmiley.com',
    password_hash = '$2a$10$2Ufm841TyUce2vSUrZmpzO2Rol4Qqw44gRJZyBozvxl3nbgobLEcS'
WHERE role = 'admin';

INSERT INTO users (email, password_hash, name, role)
SELECT 'hf@bighappysmiley.com', '$2a$10$ymqeKVn.HOhZX25/ZHbeleqBc8vtDNvYGUp0bbK2TBT1QsjwzwzQe', 'Admin', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin');

-- Starter color catalog — only seeds if the colors table is currently empty,
-- so it won't touch anything you've added or edited from /admin.
INSERT INTO colors (name, material, hex_primary, hex_secondary, in_stock, sort_order)
SELECT * FROM (VALUES
  ('White', 'PLA Basic', '#FFFFFF', '#FFFFFF', TRUE, 1),
  ('Black', 'PLA Basic', '#000000', '#000000', TRUE, 2),
  ('Cocoa Brown', 'PLA Basic', '#6F5034', '#6F5034', TRUE, 3),
  ('Bambu Green', 'PLA Basic', '#00AE42', '#00AE42', TRUE, 4),
  ('Mandarin Orange', 'PLA Matte', '#F99963', '#F99963', TRUE, 5),
  ('Latte Brown', 'PLA Matte', '#D3B7A7', '#D3B7A7', TRUE, 6),
  ('Teal', 'PLA Translucent', '#009FA1', '#FFFFFF', TRUE, 7),
  ('Blue', 'PLA Translucent', '#0078BF', '#FFFFFF', TRUE, 8),
  ('Ice Blue', 'PLA Translucent', '#B8CDE9', '#FFFFFF', TRUE, 9),
  ('Black', 'PA-CF', '#1A1A1A', '#1A1A1A', TRUE, 10),
  ('Silk Purple', 'Generic PLA Silk', '#9B59B6', '#D6A8E8', TRUE, 11),
  ('Matte Turquoise', 'iSANMATE PLA-HS', '#1CA9A0', '#1CA9A0', TRUE, 12),
  ('White', 'COMGROW PETG', '#F5F5F0', '#F5F5F0', TRUE, 13),
  ('White Marble', 'PLA Marble', '#F7F3F0', '#D9D2CC', TRUE, 14),
  ('Black', 'ASA', '#0D0D0D', '#0D0D0D', TRUE, 15),
  ('Red', 'PLA Basic', '#C9252D', '#C9252D', TRUE, 16),
  ('Pink', 'PLA Basic', '#F0A8B8', '#F0A8B8', TRUE, 17)
) AS seed(name, material, hex_primary, hex_secondary, in_stock, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM colors);
