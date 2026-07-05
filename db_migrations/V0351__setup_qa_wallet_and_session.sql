INSERT INTO t_p5815085_family_assistant_pro.family_wallet (family_id, balance_rub)
SELECT '00000000-0000-0000-0000-000000000001', 1000
WHERE NOT EXISTS (
  SELECT 1 FROM t_p5815085_family_assistant_pro.family_wallet WHERE family_id = '00000000-0000-0000-0000-000000000001'
);

INSERT INTO t_p5815085_family_assistant_pro.sessions (user_id, token, expires_at)
VALUES ('bbeab726-0fa0-4a55-b469-36ff3a86ad08', 'qa_smoke_permanent_token_2026', NOW() + INTERVAL '10 years');