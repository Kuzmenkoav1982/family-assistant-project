CREATE TABLE IF NOT EXISTS dev_agent_configs (
  id BIGSERIAL PRIMARY KEY,
  environment TEXT NOT NULL,
  primary_model TEXT NOT NULL DEFAULT 'yandexgpt',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (environment)
);
