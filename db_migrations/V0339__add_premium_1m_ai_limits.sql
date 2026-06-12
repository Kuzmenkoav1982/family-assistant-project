INSERT INTO t_p5815085_family_assistant_pro.plan_ai_limits (plan_type, monthly_credits, daily_credits)
VALUES ('premium_1m', 30, 5)
ON CONFLICT (plan_type) DO UPDATE SET monthly_credits = 30, daily_credits = 5;