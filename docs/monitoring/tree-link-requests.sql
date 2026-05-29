-- Post-deploy monitoring: tree_link_requests
-- Прогонять после выкладки и 2-3 раза в первые 24 часа.
-- Схема: t_p5815085_family_assistant_pro

-- A. Зависшие pending-заявки (не обработаны > 48 ч)
-- Ожидаемый результат после relase: 0 строк
SELECT
  family_id,
  COUNT(*)             AS stale_pending_count,
  MIN(created_at)      AS oldest_created_at
FROM t_p5815085_family_assistant_pro.tree_link_requests
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '48 hours'
GROUP BY family_id
HAVING COUNT(*) > 0
ORDER BY stale_pending_count DESC;


-- B. Pending-заявки без уведомления owner/admin
-- Если строки есть — notify-цепочка сломана на create_request
-- Связь через target_url (поля request_id в notifications нет)
SELECT
  r.id          AS request_id,
  r.family_id,
  r.user_id,
  r.created_at
FROM t_p5815085_family_assistant_pro.tree_link_requests r
LEFT JOIN t_p5815085_family_assistant_pro.notifications n
  ON n.target_url = '/tree?panel=requests&requestId=' || r.id::text
 AND n.type = 'tree_link_request_created'
WHERE r.status = 'pending'
GROUP BY r.id, r.family_id, r.user_id, r.created_at
HAVING COUNT(n.id) = 0
ORDER BY r.created_at DESC;


-- C. Дубли непрочитанных уведомлений по одной заявке
-- Если строки есть — дедупликация в notify_owners сломана
SELECT
  target_url,
  user_id,
  COUNT(*) AS unread_duplicates
FROM t_p5815085_family_assistant_pro.notifications
WHERE type = 'tree_link_request_created'
  AND status = 'sent'
GROUP BY target_url, user_id
HAVING COUNT(*) > 1
ORDER BY unread_duplicates DESC;


-- D. Расклад по статусам (общая температура)
SELECT
  status,
  COUNT(*) AS cnt
FROM t_p5815085_family_assistant_pro.tree_link_requests
GROUP BY status
ORDER BY cnt DESC;
