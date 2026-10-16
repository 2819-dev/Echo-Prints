ALTER TABLE products ADD COLUMN IF NOT EXISTS allow_multi_color BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS product_colors (
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id INTEGER NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, color_id)
);
CREATE INDEX IF NOT EXISTS idx_product_colors_product ON product_colors(product_id);

ALTER TABLE shop_order_items ADD COLUMN IF NOT EXISTS colors TEXT;
