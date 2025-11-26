-- Создание таблицы tasks (если не существует)
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assignee_id UUID REFERENCES t_p5815085_family_assistant_pro.family_members(id),
    completed BOOLEAN DEFAULT FALSE,
    points INTEGER DEFAULT 10,
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(50),
    reminder_time VARCHAR(5),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency VARCHAR(20),
    recurring_interval INTEGER,
    recurring_days_of_week TEXT,
    recurring_end_date DATE,
    next_occurrence DATE,
    cooking_day VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска (если не существуют)
CREATE INDEX IF NOT EXISTS idx_tasks_family_id ON t_p5815085_family_assistant_pro.tasks(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON t_p5815085_family_assistant_pro.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON t_p5815085_family_assistant_pro.tasks(completed);