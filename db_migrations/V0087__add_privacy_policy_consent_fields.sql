ALTER TABLE t_p5815085_family_assistant_pro.users 
ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT FALSE;

ALTER TABLE t_p5815085_family_assistant_pro.users 
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP;

ALTER TABLE t_p5815085_family_assistant_pro.users 
ADD COLUMN IF NOT EXISTS privacy_policy_accepted_ip VARCHAR(45);