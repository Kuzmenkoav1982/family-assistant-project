-- Исправляем все foreign key constraints с правильным экранированием схемы

-- alice_users
ALTER TABLE "t_p5815085_family_assistant_pro".alice_users DROP CONSTRAINT IF EXISTS alice_users_family_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".alice_users DROP CONSTRAINT IF EXISTS alice_users_member_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".alice_users ADD CONSTRAINT alice_users_family_id_fkey FOREIGN KEY (family_id) REFERENCES "t_p5815085_family_assistant_pro".families(id);
ALTER TABLE "t_p5815085_family_assistant_pro".alice_users ADD CONSTRAINT alice_users_member_id_fkey FOREIGN KEY (member_id) REFERENCES "t_p5815085_family_assistant_pro".family_members(id);

-- family_invites
ALTER TABLE "t_p5815085_family_assistant_pro".family_invites DROP CONSTRAINT IF EXISTS family_invites_created_by_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".family_invites DROP CONSTRAINT IF EXISTS family_invites_family_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".family_invites ADD CONSTRAINT family_invites_created_by_fkey FOREIGN KEY (created_by) REFERENCES "t_p5815085_family_assistant_pro".users(id);
ALTER TABLE "t_p5815085_family_assistant_pro".family_invites ADD CONSTRAINT family_invites_family_id_fkey FOREIGN KEY (family_id) REFERENCES "t_p5815085_family_assistant_pro".families(id);

-- family_members
ALTER TABLE "t_p5815085_family_assistant_pro".family_members DROP CONSTRAINT IF EXISTS family_members_family_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".family_members DROP CONSTRAINT IF EXISTS family_members_user_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".family_members ADD CONSTRAINT family_members_family_id_fkey FOREIGN KEY (family_id) REFERENCES "t_p5815085_family_assistant_pro".families(id);
ALTER TABLE "t_p5815085_family_assistant_pro".family_members ADD CONSTRAINT family_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES "t_p5815085_family_assistant_pro".users(id);

-- password_reset_tokens
ALTER TABLE "t_p5815085_family_assistant_pro".password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_user_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".password_reset_tokens ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES "t_p5815085_family_assistant_pro".users(id);

-- payments
ALTER TABLE "t_p5815085_family_assistant_pro".payments DROP CONSTRAINT IF EXISTS payments_family_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".payments DROP CONSTRAINT IF EXISTS payments_subscription_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".payments ADD CONSTRAINT payments_family_id_fkey FOREIGN KEY (family_id) REFERENCES "t_p5815085_family_assistant_pro".families(id);
ALTER TABLE "t_p5815085_family_assistant_pro".payments ADD CONSTRAINT payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES "t_p5815085_family_assistant_pro".subscriptions(id);
ALTER TABLE "t_p5815085_family_assistant_pro".payments ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES "t_p5815085_family_assistant_pro".users(id);

-- reminders
ALTER TABLE "t_p5815085_family_assistant_pro".reminders DROP CONSTRAINT IF EXISTS reminders_task_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".reminders ADD CONSTRAINT reminders_task_id_fkey FOREIGN KEY (task_id) REFERENCES "t_p5815085_family_assistant_pro".tasks(id);

-- sessions
ALTER TABLE "t_p5815085_family_assistant_pro".sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".sessions ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES "t_p5815085_family_assistant_pro".users(id);

-- subscriptions
ALTER TABLE "t_p5815085_family_assistant_pro".subscriptions DROP CONSTRAINT IF EXISTS subscriptions_family_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".subscriptions ADD CONSTRAINT subscriptions_family_id_fkey FOREIGN KEY (family_id) REFERENCES "t_p5815085_family_assistant_pro".families(id);

-- verification_codes
ALTER TABLE "t_p5815085_family_assistant_pro".verification_codes DROP CONSTRAINT IF EXISTS verification_codes_user_id_fkey;
ALTER TABLE "t_p5815085_family_assistant_pro".verification_codes ADD CONSTRAINT verification_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES "t_p5815085_family_assistant_pro".users(id);