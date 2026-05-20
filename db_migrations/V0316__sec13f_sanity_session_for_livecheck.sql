-- SEC-1.3f: Live sanity-check — создаём временную тестовую сессию для positive-path.
-- token = 'sec13f_sanity_live_check_token_v1'
-- hash = sha256('sec13f_sanity_live_check_token_v1')
-- Эта сессия будет немедленно использована для проверки и отозвана.

INSERT INTO admin_sessions (token_hash, admin_email, expires_at, created_at, last_used_at)
VALUES (
  encode(sha256('sec13f_sanity_live_check_token_v1'::bytea), 'hex'),
  'sanity-sec13f@check.internal',
  now() + interval '5 minutes',
  now(),
  now()
);
