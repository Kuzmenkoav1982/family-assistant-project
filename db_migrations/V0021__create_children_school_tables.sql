-- Таблица школьных данных
CREATE TABLE IF NOT EXISTS children_school (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL UNIQUE,
    family_id VARCHAR(255) NOT NULL,
    mesh_integration BOOLEAN DEFAULT FALSE,
    current_grade VARCHAR(50),
    school_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица оценок
CREATE TABLE IF NOT EXISTS children_grades (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    subject VARCHAR(255) NOT NULL,
    grade INTEGER NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица домашних заданий
CREATE TABLE IF NOT EXISTS children_homework (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    subject VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_school_member ON children_school(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_grades_school ON children_grades(school_id);
CREATE INDEX IF NOT EXISTS idx_grades_date ON children_grades(date);
CREATE INDEX IF NOT EXISTS idx_homework_school ON children_homework(school_id);
CREATE INDEX IF NOT EXISTS idx_homework_due ON children_homework(due_date);
CREATE INDEX IF NOT EXISTS idx_homework_status ON children_homework(completed);
