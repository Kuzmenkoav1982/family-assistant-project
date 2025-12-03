-- Создаём таблицу для расширенных профилей членов семьи
CREATE TABLE IF NOT EXISTS member_profiles (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    family_id UUID NOT NULL,
    
    -- Базовая информация
    birth_date DATE,
    birth_time TIME,
    birth_place VARCHAR(255),
    height INTEGER, -- в см
    weight DECIMAL(5,2), -- в кг
    
    -- Психология и характер
    love_languages JSONB DEFAULT '[]', -- ["Слова одобрения", "Время вместе", ...]
    triggers JSONB DEFAULT '[]', -- ["Повышенный тон", "Игнорирование", ...]
    boundaries TEXT, -- Текстовое описание границ
    stress_relief JSONB DEFAULT '[]', -- ["Прогулка", "Музыка", ...]
    personality_type VARCHAR(50), -- MBTI, соционика и т.д.
    
    -- Привычки и образ жизни
    good_habits JSONB DEFAULT '[]',
    bad_habits JSONB DEFAULT '[]',
    hobbies JSONB DEFAULT '[]',
    lifestyle VARCHAR(50), -- "Жаворонок", "Сова", "Голубь"
    energy_type VARCHAR(50), -- "Интроверт", "Экстраверт", "Амбиверт"
    
    -- Свободная форма
    additional_info TEXT,
    
    -- Метаданные
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_member_profile UNIQUE(member_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_member_profiles_member ON member_profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_member_profiles_family ON member_profiles(family_id);