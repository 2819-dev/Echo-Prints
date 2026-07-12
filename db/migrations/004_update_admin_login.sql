-- Update admin login. Change the password from /account after logging in.
UPDATE users
SET email = 'hf@bighappysmiely.com',
    password_hash = '$2a$10$2Ufm841TyUce2vSUrZmpzO2Rol4Qqw44gRJZyBozvxl3nbgobLEcS'
WHERE role = 'admin';
