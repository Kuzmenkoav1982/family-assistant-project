-- Добавляем колонку для управления доступами членов семьи
ALTER TABLE t_p5815085_family_assistant_pro.family_members 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"tasks": true, "calendar": true, "traditions": true, "blog": true, "meals": true, "education": true, "tree": true, "chat": true, "album": true}'::jsonb;

-- Добавляем индекс для быстрого поиска по permissions
CREATE INDEX IF NOT EXISTS idx_family_members_permissions 
ON t_p5815085_family_assistant_pro.family_members USING gin(permissions);

-- Обновляем существующих членов семьи с дефолтными правами
UPDATE t_p5815085_family_assistant_pro.family_members 
SET permissions = '{"tasks": true, "calendar": true, "traditions": true, "blog": true, "meals": true, "education": true, "tree": true, "chat": true, "album": true}'::jsonb
WHERE permissions IS NULL;
