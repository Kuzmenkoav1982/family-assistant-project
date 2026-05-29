-- Исправление: владельцы семей должны иметь access_role = 'admin'
-- Баг: при определённом сценарии регистрации access_role выставлялся в 'viewer'
UPDATE t_p5815085_family_assistant_pro.family_members
SET access_role = 'admin'
WHERE role ILIKE '%влад%'
  AND access_role NOT IN ('admin', 'owner');