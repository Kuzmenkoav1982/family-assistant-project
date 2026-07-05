INSERT INTO t_p5815085_family_assistant_pro.family_members (family_id, name, user_id, role, access_role, member_status)
SELECT '00000000-0000-0000-0000-000000000001', 'QA Smoke', 'bbeab726-0fa0-4a55-b469-36ff3a86ad08', 'Владелец', 'admin', 'active'
WHERE NOT EXISTS (
  SELECT 1 FROM t_p5815085_family_assistant_pro.family_members WHERE user_id = 'bbeab726-0fa0-4a55-b469-36ff3a86ad08'
);