-- Добавление поля account_type для различия между полноценными аккаунтами и детскими профилями
ALTER TABLE t_p5815085_family_assistant_pro.family_members 
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'full' CHECK (account_type IN ('full', 'child_profile'));

-- Обновляем существующие записи: если есть user_id - это полноценный аккаунт, если нет - детский профиль
UPDATE t_p5815085_family_assistant_pro.family_members 
SET account_type = CASE 
    WHEN user_id IS NOT NULL THEN 'full'
    ELSE 'child_profile'
END
WHERE account_type IS NULL;

-- Добавляем индекс для быстрой фильтрации активных участников голосований
CREATE INDEX IF NOT EXISTS idx_family_members_account_type 
ON t_p5815085_family_assistant_pro.family_members(account_type);

COMMENT ON COLUMN t_p5815085_family_assistant_pro.family_members.account_type IS 
'Тип аккаунта: full - полноценный аккаунт с входом (участвует в голосованиях), child_profile - профиль ребенка без входа (не участвует в голосованиях)';
