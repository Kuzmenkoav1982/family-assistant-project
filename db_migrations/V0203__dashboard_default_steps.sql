-- Шаги чек-листа для каждого раздела (по 5 шагов = 220 всего)

INSERT INTO t_p5815085_family_assistant_pro.dashboard_steps (section_id, slug, title, position)
SELECT s.id, st.slug, st.title, st.position
FROM t_p5815085_family_assistant_pro.dashboard_sections s
CROSS JOIN LATERAL (VALUES
  ('step1', 'Заполнить базовую информацию', 0),
  ('step2', 'Добавить первую запись',       1),
  ('step3', 'Настроить параметры',          2),
  ('step4', 'Пригласить участников',        3),
  ('step5', 'Проверить и сохранить',        4)
) AS st(slug, title, position)
WHERE NOT EXISTS (
  SELECT 1 FROM t_p5815085_family_assistant_pro.dashboard_steps ds WHERE ds.section_id = s.id
);
