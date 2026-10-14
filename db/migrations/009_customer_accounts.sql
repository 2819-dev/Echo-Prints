-- Real customer accounts: customers can sign up, log in, and see their
-- order history. Guest checkout (no account) still works -- shop_orders.user_id
-- is nullable and only set when the customer was logged in at checkout.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'printer', 'retailer', 'customer'));

ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_shop_orders_user ON shop_orders(user_id);
