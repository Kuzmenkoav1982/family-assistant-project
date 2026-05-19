-- SEC-1.3c tests: постоянная seed-сессия для backend tests.
-- token: 'ci_test_admin_session_token_v1'
-- sha256 = известный хеш для тестов.
-- Срок: 2099 год — не истечёт в тестах.
INSERT INTO admin_sessions (
  token_hash,
  admin_email,
  created_at,
  expires_at,
  last_used_at
)
SELECT
  encode(sha256('ci_test_admin_session_token_v1'::bytea), 'hex'),
  'ci-test@admin.local',
  now(),
  '2099-01-01T00:00:00+00:00',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM admin_sessions WHERE admin_email = 'ci-test@admin.local'
);
