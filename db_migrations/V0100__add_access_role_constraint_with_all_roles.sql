-- Добавление CHECK constraint для поля access_role с поддержкой всех ролей системы

-- Удаляем старый constraint, если он существует (игнорируем ошибки)
ALTER TABLE t_p5815085_family_assistant_pro.family_members 
DROP CONSTRAINT IF EXISTS family_members_access_role_check;

-- Добавляем новый constraint с полным списком допустимых ролей
ALTER TABLE t_p5815085_family_assistant_pro.family_members
ADD CONSTRAINT family_members_access_role_check 
CHECK (access_role IN ('admin', 'parent', 'guardian', 'viewer', 'child'));