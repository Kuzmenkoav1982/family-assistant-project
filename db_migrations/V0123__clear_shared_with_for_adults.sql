-- Очистить shared_with для взрослых профилей (18+)
-- У взрослых с privacy='private' не должно быть доступа другим

UPDATE t_p5815085_family_assistant_pro.health_profiles hp
SET shared_with = '{}'
FROM t_p5815085_family_assistant_pro.family_members fm
WHERE hp.user_id = fm.id::text 
  AND fm.age >= 18 
  AND hp.privacy = 'private'
  AND array_length(hp.shared_with, 1) > 0;