-- Добавляем user_id в push_subscriptions для персональных уведомлений
ALTER TABLE t_p5815085_family_assistant_pro.push_subscriptions 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Обновляем существующие записи: назначаем первого админа семьи как владельца подписки
UPDATE t_p5815085_family_assistant_pro.push_subscriptions ps
SET user_id = (
    SELECT user_id 
    FROM t_p5815085_family_assistant_pro.family_members fm
    WHERE fm.family_id::text = ps.family_id::text
    LIMIT 1
)
WHERE user_id IS NULL;

-- Удаляем старое ограничение на family_id
ALTER TABLE t_p5815085_family_assistant_pro.push_subscriptions 
DROP CONSTRAINT IF EXISTS push_subscriptions_family_id_key;

-- Создаем уникальный индекс на комбинацию user_id + endpoint (из subscription_data)
CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_user_endpoint_idx 
ON t_p5815085_family_assistant_pro.push_subscriptions (user_id, family_id);

-- Создаем индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx 
ON t_p5815085_family_assistant_pro.push_subscriptions (user_id);