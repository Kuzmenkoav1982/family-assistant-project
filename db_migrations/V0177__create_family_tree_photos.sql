CREATE TABLE t_p5815085_family_assistant_pro.family_tree_photos (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tree_photos_member ON t_p5815085_family_assistant_pro.family_tree_photos(member_id);