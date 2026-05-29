-- Search v2: таблица search_index (расширения pg_trgm/unaccent ставятся отдельно)

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.search_index (
  id            BIGSERIAL PRIMARY KEY,
  entity_type   VARCHAR(50)  NOT NULL,
  entity_id     VARCHAR(100) NOT NULL,
  title         TEXT         NOT NULL DEFAULT '',
  content       TEXT         NOT NULL DEFAULT '',
  url           TEXT         NOT NULL DEFAULT '',
  family_id     UUID,
  visibility    VARCHAR(20)  NOT NULL DEFAULT 'private',
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  title_norm    TEXT,
  content_norm  TEXT,
  search_vector TSVECTOR
);

CREATE UNIQUE INDEX IF NOT EXISTS search_index_entity_uniq
  ON t_p5815085_family_assistant_pro.search_index (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS search_index_fts_idx
  ON t_p5815085_family_assistant_pro.search_index USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS search_index_family_idx
  ON t_p5815085_family_assistant_pro.search_index (family_id)
  WHERE family_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS search_index_visibility_idx
  ON t_p5815085_family_assistant_pro.search_index (visibility);
