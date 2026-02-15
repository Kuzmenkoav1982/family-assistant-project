
ALTER TABLE diet_plans ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE diet_weight_log ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE diet_quiz_answers ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE diet_mini_quiz ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE diet_motivation_log ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE diet_sos_requests ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
