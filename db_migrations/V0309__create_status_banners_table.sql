CREATE TABLE IF NOT EXISTS status_banners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  cta_label       TEXT,
  cta_href        TEXT,
  enabled         BOOLEAN NOT NULL DEFAULT FALSE,
  dismissible     BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  audience        TEXT NOT NULL DEFAULT 'all',
  route_scope     JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority        INTEGER NOT NULL DEFAULT 0,
  created_by      TEXT,
  updated_by      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at    TIMESTAMPTZ,
  unpublished_at  TIMESTAMPTZ,
  CONSTRAINT status_banners_type_chk CHECK (type IN ('info', 'maintenance', 'warning', 'critical', 'update')),
  CONSTRAINT status_banners_audience_chk CHECK (audience IN ('all', 'authenticated', 'admins')),
  CONSTRAINT status_banners_title_not_empty_chk CHECK (char_length(trim(title)) > 0),
  CONSTRAINT status_banners_message_not_empty_chk CHECK (char_length(trim(message)) > 0),
  CONSTRAINT status_banners_cta_pair_chk CHECK ((cta_label IS NULL AND cta_href IS NULL) OR (cta_label IS NOT NULL AND char_length(trim(cta_label)) > 0 AND cta_href IS NOT NULL AND char_length(trim(cta_href)) > 0)),
  CONSTRAINT status_banners_date_window_chk CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at),
  CONSTRAINT status_banners_route_scope_is_array_chk CHECK (jsonb_typeof(route_scope) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_status_banners_enabled ON status_banners (enabled) WHERE enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_status_banners_starts_at ON status_banners (starts_at);
CREATE INDEX IF NOT EXISTS idx_status_banners_ends_at ON status_banners (ends_at);
CREATE INDEX IF NOT EXISTS idx_status_banners_priority ON status_banners (priority DESC);
CREATE INDEX IF NOT EXISTS idx_status_banners_active_lookup ON status_banners (enabled, priority DESC, published_at DESC) WHERE enabled = TRUE;

COMMENT ON TABLE status_banners IS 'Global status banner (info/maintenance/warning/critical/update). Resolved at runtime by src/lib/statusBanner/resolveActiveBanner.ts. critical type is non-dismissible by default; helper enforces this when dismissible was not explicitly set.';
COMMENT ON COLUMN status_banners.route_scope IS 'JSONB array of URL prefixes (e.g. ["/portfolio", "/workshop"]). Empty array = global.';
COMMENT ON COLUMN status_banners.priority IS 'Higher = shown first when multiple active. Recommended defaults: critical=100, warning=50, maintenance=30, update=20, info=10.';
