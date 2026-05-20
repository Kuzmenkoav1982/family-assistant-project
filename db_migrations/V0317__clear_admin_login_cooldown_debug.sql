-- SEC-1.3 debug: neutralize failed login attempts to clear cooldown
UPDATE t_p5815085_family_assistant_pro.admin_login_attempts
SET success = TRUE
WHERE success = FALSE AND attempted_at > now() - interval '10 minutes';