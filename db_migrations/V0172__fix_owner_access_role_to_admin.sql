UPDATE t_p5815085_family_assistant_pro.family_members 
SET access_role = 'admin' 
WHERE role = 'Владелец' AND access_role != 'admin';

ALTER TABLE t_p5815085_family_assistant_pro.family_members 
ALTER COLUMN access_role SET DEFAULT 'viewer';