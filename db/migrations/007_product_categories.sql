-- Group products into categories (Clickers, Fidgets, Game Books, etc.) for the shop page.
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
