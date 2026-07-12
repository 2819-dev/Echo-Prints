-- Bootstrap admin account (change this password after first login, from /admin/account)
INSERT INTO users (email, password_hash, name, role)
VALUES (
  'orshfrankel@gmail.com',
  '$2a$10$85sZpwOuJ8ZApVBTftTMX.unbGl0SBbgvTYPFim0QdxoZDZJvPefO',
  'Orsh',
  'admin'
);

-- Starter Bambu Lab Silk Dual-Color ("swirl") catalog. Edit freely from /admin.
INSERT INTO colors (name, material, hex_primary, hex_secondary, in_stock, sort_order) VALUES
  ('Gilded Rose', 'Bambu Lab Silk Dual-Color (Swirl)', '#c9a86a', '#b5495b', TRUE, 1),
  ('Blue Hawaii', 'Bambu Lab Silk Dual-Color (Swirl)', '#1f8fc4', '#12c48f', TRUE, 2),
  ('Neon City', 'Bambu Lab Silk Dual-Color (Swirl)', '#ff2d95', '#00e5ff', TRUE, 3),
  ('Black Gold', 'Bambu Lab Silk Dual-Color (Swirl)', '#151515', '#d4af37', TRUE, 4),
  ('Violet Purple', 'Bambu Lab Silk Dual-Color (Swirl)', '#6a3ec1', '#b388ff', FALSE, 5),
  ('Grey Green', 'Bambu Lab Silk Dual-Color (Swirl)', '#7a8b7f', '#3f4f43', TRUE, 6);
