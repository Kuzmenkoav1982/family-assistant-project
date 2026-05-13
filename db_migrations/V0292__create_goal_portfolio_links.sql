-- Этап 3.3.1: связь Workshop goal с Portfolio item.
-- Отдельная таблица, чтобы не мешать семантику с goal_action_links (там actions).
-- many-to-many: одна goal -- много items, один item -- много goals.
-- На текущем этапе item_type = 'achievement' (member_achievements).
-- Расширяемо: можно потом добавить 'development_plan', 'skill' и т.д.

CREATE TABLE IF NOT EXISTS goal_portfolio_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES life_goals(id),
    item_type VARCHAR(32) NOT NULL,
    item_id UUID NOT NULL,
    meta JSONB DEFAULT '{}'::jsonb,
    linked_by UUID,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT goal_portfolio_links_unique_pair UNIQUE (goal_id, item_type, item_id),
    CONSTRAINT goal_portfolio_links_item_type_check CHECK (item_type IN ('achievement', 'development_plan'))
);

CREATE INDEX IF NOT EXISTS idx_goal_portfolio_links_goal ON goal_portfolio_links(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_portfolio_links_item ON goal_portfolio_links(item_type, item_id);
