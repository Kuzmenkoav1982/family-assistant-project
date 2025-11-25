-- Добавляем поддержку OAuth провайдеров (Яндекс, Google и т.д.)
ALTER TABLE t_p5815085_family_assistant_pro.users
ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Уникальный индекс для OAuth
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth 
ON t_p5815085_family_assistant_pro.users(oauth_provider, oauth_id) 
WHERE oauth_provider IS NOT NULL;

-- Обновляем constraint - теперь допускаем OAuth без пароля
ALTER TABLE t_p5815085_family_assistant_pro.users
DROP CONSTRAINT IF EXISTS check_email_or_phone;

ALTER TABLE t_p5815085_family_assistant_pro.users
ADD CONSTRAINT check_auth_method CHECK (
    email IS NOT NULL OR 
    phone IS NOT NULL OR 
    (oauth_provider IS NOT NULL AND oauth_id IS NOT NULL)
);