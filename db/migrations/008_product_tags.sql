-- Tag products as customizable / discontinued / limited edition, matching the
-- purple/red/orange highlight key from the original price list.
ALTER TABLE products ADD COLUMN IF NOT EXISTS tag TEXT CHECK (tag IN ('customizable', 'discontinued', 'limited_edition'));
