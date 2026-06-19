CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.product_events (
  id             BIGSERIAL PRIMARY KEY,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- что произошло
  event_name     VARCHAR(64)  NOT NULL,
  source         VARCHAR(16)  NOT NULL DEFAULT 'web', -- web | backend | system

  -- кто
  user_id        UUID         NULL,
  family_id      UUID         NULL,
  session_id     VARCHAR(64)  NULL,
  anonymous_id   VARCHAR(64)  NULL,

  -- где
  path           VARCHAR(256) NULL,
  referrer       VARCHAR(512) NULL,

  -- utm
  utm_source     VARCHAR(128) NULL,
  utm_medium     VARCHAR(128) NULL,
  utm_campaign   VARCHAR(128) NULL,

  -- доп. данные (без PII: без email, текста чатов, AI-запросов)
  properties     JSONB        NULL,

  -- идемпотентность: одно действие = одна запись
  event_id       UUID         NULL UNIQUE DEFAULT gen_random_uuid()
);

CREATE INDEX IF NOT EXISTS product_events_created_at_idx  ON t_p5815085_family_assistant_pro.product_events (created_at DESC);
CREATE INDEX IF NOT EXISTS product_events_event_name_idx  ON t_p5815085_family_assistant_pro.product_events (event_name);
CREATE INDEX IF NOT EXISTS product_events_user_id_idx     ON t_p5815085_family_assistant_pro.product_events (user_id);
CREATE INDEX IF NOT EXISTS product_events_family_id_idx   ON t_p5815085_family_assistant_pro.product_events (family_id);
CREATE INDEX IF NOT EXISTS product_events_session_id_idx  ON t_p5815085_family_assistant_pro.product_events (session_id);
