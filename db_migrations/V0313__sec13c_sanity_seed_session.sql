-- SEC-1.3c sanity: seed session для live verify-check.
-- sha256('sanity_test_token_sec13c') = известное значение для проверки.
-- Используем статический токен 'sanity_test_token_sec13c' только для проверки
-- что verify endpoint работает. Удалим сразу после.
INSERT INTO admin_sessions (
  token_hash,
  admin_email,
  created_at,
  expires_at,
  last_used_at
)
SELECT
  encode(sha256('sanity_test_token_sec13c'::bytea), 'hex'),
  'sanity@test.local',
  now(),
  now() + interval '5 minutes',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM admin_sessions WHERE admin_email = 'sanity@test.local'
);
