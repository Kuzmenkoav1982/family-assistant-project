-- Догоняющая доставка рассылки "МЫ В РЕЕСТРЕ РОССИЙСКОГО ПО", отправленной до фикса
-- broadcasts_send(): раньше функция считала аудиторию и писала статистику в
-- admin_broadcasts, но не создавала реальные записи в notifications, поэтому
-- пользователи не видели рассылку в колокольчике. Создаём их задним числом.
INSERT INTO t_p5815085_family_assistant_pro.notifications
    (user_id, type, title, message, target_url, channel, status, sent_at, created_at)
SELECT
    u.id,
    'broadcast',
    b.title,
    b.message,
    '/notifications',
    'in_app',
    'sent',
    b.created_at,
    b.created_at
FROM t_p5815085_family_assistant_pro.users u
CROSS JOIN t_p5815085_family_assistant_pro.admin_broadcasts b
WHERE b.id = 'cd89a94a-0330-4e75-b14d-d19796113293'
  AND NOT EXISTS (
    SELECT 1 FROM t_p5815085_family_assistant_pro.notifications n
    WHERE n.user_id = u.id AND n.type = 'broadcast' AND n.title = b.title
  );