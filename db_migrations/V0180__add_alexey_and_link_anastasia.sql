INSERT INTO t_p5815085_family_assistant_pro.family_tree 
  (family_id, name, relation, birth_year, parent_id, parent2_id, spouse_id, avatar)
SELECT family_id, 'Алексей Викторович Кузьменко', 'Я', 1982, 2, 3, 5, '👨'
FROM t_p5815085_family_assistant_pro.family_tree WHERE id = 2 LIMIT 1;

UPDATE t_p5815085_family_assistant_pro.family_tree 
SET spouse_id = (SELECT id FROM t_p5815085_family_assistant_pro.family_tree WHERE name = 'Алексей Викторович Кузьменко' LIMIT 1)
WHERE id = 5;