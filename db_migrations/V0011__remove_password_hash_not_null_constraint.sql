-- Удаляем NOT NULL constraint для password_hash (для OAuth пользователей)
ALTER TABLE t_p5815085_family_assistant_pro.users
DROP CONSTRAINT IF EXISTS "175413_178656_4_not_null";