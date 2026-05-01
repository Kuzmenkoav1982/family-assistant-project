-- Меняем user_id на VARCHAR, чтобы поддерживать любые ID (числовые, UUID, email)
ALTER TABLE t_p5815085_family_assistant_pro.dashboard_user_progress
  ALTER COLUMN user_id TYPE VARCHAR(128) USING user_id::VARCHAR;
