-- Повышаем права Ильи с child до parent чтобы он видел всех членов семьи
UPDATE t_p5815085_family_assistant_pro.family_members 
SET access_role = 'parent',
    permissions = '{"blog": true, "chat": true, "tree": true, "album": true, "meals": true, "tasks": true, "calendar": true, "education": true, "traditions": true, "canEditTasks": true, "canViewStats": true, "canEditEvents": true}'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'f0b4b417-9228-4d98-a0e1-65ba92a4ea2f';