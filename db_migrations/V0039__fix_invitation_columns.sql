-- Исправление названий колонок в таблице приглашений
ALTER TABLE t_p5815085_family_assistant_pro.family_invitations 
  RENAME COLUMN role TO access_role;

ALTER TABLE t_p5815085_family_assistant_pro.family_invitations 
  RENAME COLUMN used_by TO used_by_email;