UPDATE t_p5815085_family_assistant_pro.family_members fm
SET tree_node_id = ft.id
FROM t_p5815085_family_assistant_pro.family_tree ft
WHERE ft.family_id = fm.family_id::text
  AND lower(trim(ft.name)) = lower(trim(fm.name))
  AND fm.tree_node_id IS NULL;