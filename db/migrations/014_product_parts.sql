-- Multi-part products: a product can be decomposed into named parts
-- (e.g. a 3-part shelf: "Top", "Legs", "Shelf"), each with its own
-- independent set of allowed colors. When a product has parts, the shopper
-- picks one color per part instead of the single/multi product-level color
-- picker (product_colors). Parts are optional — a product with none keeps
-- using the existing product_colors flow unchanged.
CREATE TABLE IF NOT EXISTS product_parts (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_product_parts_product ON product_parts(product_id);

CREATE TABLE IF NOT EXISTS product_part_colors (
  part_id INTEGER NOT NULL REFERENCES product_parts(id) ON DELETE CASCADE,
  color_id INTEGER NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (part_id, color_id)
);
CREATE INDEX IF NOT EXISTS idx_product_part_colors_part ON product_part_colors(part_id);
