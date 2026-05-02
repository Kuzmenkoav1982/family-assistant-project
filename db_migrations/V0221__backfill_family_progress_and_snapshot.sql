-- Восстанавливаем прогресс общих (family) хабов: переносим из user-таблиц в family-таблицы.
-- Берём максимально "продвинутое" состояние любого члена семьи: если хоть кто-то отметил шаг — он отмечен.

INSERT INTO t_p5815085_family_assistant_pro.dashboard_family_progress
  (family_id, step_id, completed, completed_at, completed_by, updated_at)
SELECT
  fm.family_id::text AS family_id,
  up.step_id,
  bool_or(up.completed) AS completed,
  MAX(up.completed_at) AS completed_at,
  (ARRAY_AGG(up.user_id::text ORDER BY up.completed DESC, up.completed_at DESC NULLS LAST))[1] AS completed_by,
  MAX(up.updated_at) AS updated_at
FROM t_p5815085_family_assistant_pro.dashboard_user_progress up
JOIN t_p5815085_family_assistant_pro.dashboard_steps st ON st.id = up.step_id
JOIN t_p5815085_family_assistant_pro.dashboard_sections s ON s.id = st.section_id
JOIN t_p5815085_family_assistant_pro.dashboard_hubs h ON h.id = s.hub_id
JOIN t_p5815085_family_assistant_pro.family_members fm ON fm.user_id::text = up.user_id::text
WHERE COALESCE(h.scope, 'family') = 'family'
GROUP BY fm.family_id::text, up.step_id
ON CONFLICT (family_id, step_id) DO UPDATE
  SET completed = EXCLUDED.completed OR t_p5815085_family_assistant_pro.dashboard_family_progress.completed,
      completed_at = COALESCE(EXCLUDED.completed_at, t_p5815085_family_assistant_pro.dashboard_family_progress.completed_at),
      updated_at = GREATEST(EXCLUDED.updated_at, t_p5815085_family_assistant_pro.dashboard_family_progress.updated_at);

-- Переносим настройки авто/ручной режим: если хоть один член семьи переключил на 'auto' — для семьи будет 'auto'
INSERT INTO t_p5815085_family_assistant_pro.dashboard_family_settings
  (family_id, section_id, mode, updated_at)
SELECT
  fm.family_id::text AS family_id,
  us.section_id,
  CASE WHEN bool_or(us.mode = 'auto') THEN 'auto' ELSE 'manual' END AS mode,
  MAX(us.updated_at) AS updated_at
FROM t_p5815085_family_assistant_pro.dashboard_user_settings us
JOIN t_p5815085_family_assistant_pro.dashboard_sections s ON s.id = us.section_id
JOIN t_p5815085_family_assistant_pro.dashboard_hubs h ON h.id = s.hub_id
JOIN t_p5815085_family_assistant_pro.family_members fm ON fm.user_id::text = us.user_id::text
WHERE COALESCE(h.scope, 'family') = 'family'
GROUP BY fm.family_id::text, us.section_id
ON CONFLICT (family_id, section_id) DO UPDATE
  SET mode = EXCLUDED.mode,
      updated_at = GREATEST(EXCLUDED.updated_at, t_p5815085_family_assistant_pro.dashboard_family_settings.updated_at);

-- Заполняем snapshot для всех семей хотя бы базовыми значениями (members_count),
-- чтобы рейтинг показывал реальное число семей сразу. Прогресс посчитается при заходе.
INSERT INTO t_p5815085_family_assistant_pro.family_dashboard_snapshot
  (family_id, members_count, overall_progress, active_hubs, completed_sections, activity_score, updated_at)
SELECT
  family_id::text,
  COUNT(*)::int AS members_count,
  0, 0, 0, 0,
  CURRENT_TIMESTAMP
FROM t_p5815085_family_assistant_pro.family_members
GROUP BY family_id::text
ON CONFLICT (family_id) DO UPDATE
  SET members_count = EXCLUDED.members_count;
