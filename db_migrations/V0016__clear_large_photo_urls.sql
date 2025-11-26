-- Очистка слишком больших base64 photo_url (более 1 МБ создают проблемы с 502)
UPDATE t_p5815085_family_assistant_pro.family_members 
SET photo_url = NULL, avatar_type = 'emoji' 
WHERE LENGTH(photo_url) > 1000000;