
CREATE TABLE t_p5815085_family_assistant_pro.tree_link_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    user_id UUID NOT NULL,
    member_id UUID NOT NULL,
    requested_role VARCHAR(64),
    action_type VARCHAR(32) NOT NULL DEFAULT 'create_new_person',
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    note TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tree_link_requests_family ON t_p5815085_family_assistant_pro.tree_link_requests(family_id);
CREATE INDEX idx_tree_link_requests_status ON t_p5815085_family_assistant_pro.tree_link_requests(status);
CREATE INDEX idx_tree_link_requests_user ON t_p5815085_family_assistant_pro.tree_link_requests(user_id);
