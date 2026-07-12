-- Orders: manual order log (product/order name, price, quantity)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);

-- Applications: structured fields instead of one generic free-text message
ALTER TABLE applications ADD COLUMN address TEXT;
ALTER TABLE applications ADD COLUMN printers_owned TEXT;
ALTER TABLE applications ADD COLUMN filaments_available TEXT;

-- Users: carry the same structured info over once an application is approved
ALTER TABLE users ADD COLUMN printers_owned TEXT;
ALTER TABLE users ADD COLUMN filaments_available TEXT;
