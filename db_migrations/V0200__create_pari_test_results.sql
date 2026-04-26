CREATE TABLE IF NOT EXISTS pari_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    family_id UUID,
    child_member_id UUID,
    answers JSONB NOT NULL,
    scale_results JSONB NOT NULL,
    overall_score INTEGER NOT NULL,
    overall_label VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pari_user ON pari_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_pari_family ON pari_test_results(family_id);
CREATE INDEX IF NOT EXISTS idx_pari_child ON pari_test_results(child_member_id);
CREATE INDEX IF NOT EXISTS idx_pari_created ON pari_test_results(created_at DESC);
