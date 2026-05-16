-- Family Memory / Album of Generations - V1 schema
-- Source of truth for family memory: entries + assets + person links + manual albums

CREATE TABLE IF NOT EXISTS memory_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    caption TEXT,
    story TEXT,
    memory_date DATE,
    memory_period_label VARCHAR(100),
    location_label VARCHAR(255),
    event_id UUID,
    cover_asset_id UUID,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_memory_entries_family ON memory_entries(family_id);
CREATE INDEX IF NOT EXISTS idx_memory_entries_event ON memory_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_memory_entries_date ON memory_entries(memory_date);
CREATE INDEX IF NOT EXISTS idx_memory_entries_archived ON memory_entries(archived_at);

CREATE TABLE IF NOT EXISTS memory_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_entry_id UUID NOT NULL,
    file_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    width INTEGER,
    height INTEGER,
    mime_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_memory_assets_entry ON memory_assets(memory_entry_id);

CREATE TABLE IF NOT EXISTS memory_person_links (
    memory_entry_id UUID NOT NULL,
    member_id INTEGER NOT NULL,
    PRIMARY KEY (memory_entry_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_memory_person_member ON memory_person_links(member_id);

CREATE TABLE IF NOT EXISTS memory_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_asset_id UUID,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_memory_albums_family ON memory_albums(family_id);
CREATE INDEX IF NOT EXISTS idx_memory_albums_archived ON memory_albums(archived_at);

CREATE TABLE IF NOT EXISTS memory_album_links (
    album_id UUID NOT NULL,
    memory_entry_id UUID NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (album_id, memory_entry_id)
);

CREATE INDEX IF NOT EXISTS idx_memory_album_links_entry ON memory_album_links(memory_entry_id);
