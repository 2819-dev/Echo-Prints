-- Adds "coming_soon" as a product tag, so an item without a price yet can be
-- shown as "Coming Soon" instead of falling into the quote-request flow.
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_tag_check;
ALTER TABLE products ADD CONSTRAINT products_tag_check
  CHECK (tag IN ('customizable', 'discontinued', 'limited_edition', 'coming_soon'));
