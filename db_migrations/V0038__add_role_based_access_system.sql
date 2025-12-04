-- Миграция: Система ролевого доступа к семье
-- Добавляет поля для управления ролями пользователей и приглашениями

-- 1. Расширение таблицы family_members
-- Добавляем новые поля для системы ролей
ALTER TABLE t_p5815085_family_assistant_pro.family_members 
  ADD COLUMN IF NOT EXISTS user_email TEXT,
  ADD COLUMN IF NOT EXISTS access_role TEXT DEFAULT 'child',
  ADD COLUMN IF NOT EXISTS invited_by UUID,
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS member_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS granular_permissions JSONB;

-- 2. Создание таблицы приглашений
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  invited_by UUID NOT NULL,
  invite_type TEXT NOT NULL,
  invite_value TEXT NOT NULL,
  access_role TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  used_by_email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_family_members_user_email ON t_p5815085_family_assistant_pro.family_members(user_email);
CREATE INDEX IF NOT EXISTS idx_family_members_access_role ON t_p5815085_family_assistant_pro.family_members(access_role);
CREATE INDEX IF NOT EXISTS idx_family_members_member_status ON t_p5815085_family_assistant_pro.family_members(member_status);
CREATE INDEX IF NOT EXISTS idx_family_invitations_family ON t_p5815085_family_assistant_pro.family_invitations(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_token ON t_p5815085_family_assistant_pro.family_invitations(token);
CREATE INDEX IF NOT EXISTS idx_family_invitations_expires ON t_p5815085_family_assistant_pro.family_invitations(expires_at);

-- 4. Обновление существующих записей
-- Устанавливаем создателя семьи как админа (первый member каждой семьи)
WITH first_members AS (
  SELECT DISTINCT ON (family_id) 
    id, 
    family_id 
  FROM t_p5815085_family_assistant_pro.family_members 
  ORDER BY family_id, created_at ASC
)
UPDATE t_p5815085_family_assistant_pro.family_members fm
SET 
  access_role = 'admin',
  member_status = 'active',
  joined_at = fm.created_at
FROM first_members
WHERE fm.id = first_members.id;

-- Остальные члены семьи получают роль child по умолчанию
UPDATE t_p5815085_family_assistant_pro.family_members
SET 
  member_status = 'active',
  joined_at = created_at
WHERE member_status IS NULL;