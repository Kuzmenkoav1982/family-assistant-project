CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.children_mood_entries (
    id SERIAL PRIMARY KEY,
    member_id UUID NOT NULL,
    mood VARCHAR(16) NOT NULL,
    note TEXT,
    entry_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_children_mood_entries_member
  ON t_p5815085_family_assistant_pro.children_mood_entries(member_id, entry_date DESC);
