
CREATE UNIQUE INDEX idx_tree_link_requests_unique_pending
ON t_p5815085_family_assistant_pro.tree_link_requests (family_id, user_id)
WHERE status = 'pending';
