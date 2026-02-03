-- Исправить приватность профилей здоровья для взрослых (18+)
-- Взрослые должны иметь privacy='private', дети - 'parents'

UPDATE t_p5815085_family_assistant_pro.health_profiles hp
SET privacy = 'private'
FROM t_p5815085_family_assistant_pro.family_members fm
WHERE hp.user_id = fm.id::text 
  AND fm.age >= 18 
  AND hp.privacy != 'private';