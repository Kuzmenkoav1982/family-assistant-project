-- Изменение типов колонок в child_invites с integer на uuid
ALTER TABLE t_p5815085_family_assistant_pro.child_invites 
  ALTER COLUMN child_member_id TYPE uuid USING child_member_id::text::uuid,
  ALTER COLUMN created_by TYPE uuid USING created_by::text::uuid;