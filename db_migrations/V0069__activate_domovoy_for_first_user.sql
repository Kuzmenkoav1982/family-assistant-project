-- Активируем донат Домового для первого пользователя (july80@mail.ru)
-- Пользователь оплатил 500₽ за подписку, даём ему уровень 2 Домового

INSERT INTO t_p5815085_family_assistant_pro.domovoy_levels (user_id, current_level, total_donated)
VALUES ('3b86fc3c-8b3c-4cb6-ad62-78a3830cc854', 2, 500)
ON CONFLICT (user_id) DO UPDATE 
SET current_level = 2, total_donated = 500, updated_at = NOW();

INSERT INTO t_p5815085_family_assistant_pro.assistant_settings (user_id, assistant_type, assistant_level, assistant_name)
VALUES ('3b86fc3c-8b3c-4cb6-ad62-78a3830cc854', 'domovoy', 2, 'Домовой')
ON CONFLICT (user_id) DO UPDATE 
SET assistant_type = 'domovoy', assistant_level = 2, assistant_name = 'Домовой', updated_at = NOW();