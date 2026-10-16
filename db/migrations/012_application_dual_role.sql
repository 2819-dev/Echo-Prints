-- Lets a printer/retailer applicant flag that they're also interested in the
-- other role, so the admin knows to follow up about it. Purely informational
-- — approving an application still only grants the single role it was for.
ALTER TABLE applications ADD COLUMN IF NOT EXISTS also_wants_other_role BOOLEAN NOT NULL DEFAULT FALSE;
