-- Создаем новую таблицу tasks_v2 с минимальной структурой
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.tasks_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    assignee_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    points INTEGER DEFAULT 10,
    priority TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'Дом',
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_tasks_v2_family_id ON t_p5815085_family_assistant_pro.tasks_v2(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_v2_assignee_id ON t_p5815085_family_assistant_pro.tasks_v2(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_v2_completed ON t_p5815085_family_assistant_pro.tasks_v2(completed);