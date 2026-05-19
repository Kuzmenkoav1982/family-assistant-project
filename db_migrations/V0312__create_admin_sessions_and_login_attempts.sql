CREATE TABLE IF NOT EXISTS admin_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash      TEXT NOT NULL UNIQUE,
  admin_email     TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL,
  last_used_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip              TEXT,
  user_agent      TEXT,
  revoked_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions (token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions (token_hash, expires_at) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  ip              TEXT,
  success         BOOLEAN NOT NULL,
  attempted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_email_time ON admin_login_attempts (email, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_ip_time ON admin_login_attempts (ip, attempted_at DESC);

COMMENT ON TABLE admin_sessions IS 'Серверные session-токены админа (SEC-1.3). token_hash = sha256(plain_token). Plain-токен живёт только у клиента в localStorage.adminSessionToken.';
COMMENT ON TABLE admin_login_attempts IS 'Аудит попыток admin-логина для cooldown / brute-force detection.';
