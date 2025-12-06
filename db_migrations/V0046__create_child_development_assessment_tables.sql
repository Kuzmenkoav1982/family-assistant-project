-- Таблица оценок развития ребенка
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.child_development_assessments (
    id SERIAL PRIMARY KEY,
    child_id INTEGER NOT NULL,
    family_id INTEGER NOT NULL,
    age_range VARCHAR(20) NOT NULL,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица навыков ребенка (результаты анкеты)
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.child_skills (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    skill_level VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица планов развития
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.development_plans (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL,
    child_id INTEGER NOT NULL,
    family_id INTEGER NOT NULL,
    plan_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Таблица выполненных задач плана
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.plan_tasks (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    task_description TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_assessments_child ON t_p5815085_family_assistant_pro.child_development_assessments(child_id);
CREATE INDEX IF NOT EXISTS idx_assessments_family ON t_p5815085_family_assistant_pro.child_development_assessments(family_id);
CREATE INDEX IF NOT EXISTS idx_skills_assessment ON t_p5815085_family_assistant_pro.child_skills(assessment_id);
CREATE INDEX IF NOT EXISTS idx_plans_child ON t_p5815085_family_assistant_pro.development_plans(child_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON t_p5815085_family_assistant_pro.development_plans(status);
CREATE INDEX IF NOT EXISTS idx_tasks_plan ON t_p5815085_family_assistant_pro.plan_tasks(plan_id);