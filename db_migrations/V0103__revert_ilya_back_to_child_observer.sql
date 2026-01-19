-- Возвращаем Илье права child (наблюдатель) как было изначально
UPDATE t_p5815085_family_assistant_pro.family_members 
SET access_role = 'child',
    permissions = '{"blog": true, "chat": true, "tree": true, "album": true, "meals": true, "tasks": true, "calendar": true, "education": true, "traditions": true}'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'f0b4b417-9228-4d98-a0e1-65ba92a4ea2f';