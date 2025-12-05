-- Таблица продуктов с калориями и БЖУ
CREATE TABLE IF NOT EXISTS nutrition_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    calories DECIMAL(10, 2) NOT NULL, -- ккал на 100г/100мл
    protein DECIMAL(10, 2) DEFAULT 0, -- белки в граммах
    fats DECIMAL(10, 2) DEFAULT 0, -- жиры в граммах
    carbs DECIMAL(10, 2) DEFAULT 0, -- углеводы в граммах
    fiber DECIMAL(10, 2) DEFAULT 0, -- клетчатка в граммах
    unit VARCHAR(20) DEFAULT 'г', -- г, мл, шт
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска продуктов
CREATE INDEX idx_nutrition_products_name ON nutrition_products(name);
CREATE INDEX idx_nutrition_products_category ON nutrition_products(category);

-- Таблица персональных норм питания
CREATE TABLE IF NOT EXISTS user_nutrition_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    daily_calories INTEGER NOT NULL DEFAULT 2000,
    daily_protein INTEGER NOT NULL DEFAULT 100, -- граммов
    daily_fats INTEGER NOT NULL DEFAULT 70, -- граммов
    daily_carbs INTEGER NOT NULL DEFAULT 250, -- граммов
    weight DECIMAL(5, 2), -- текущий вес в кг
    target_weight DECIMAL(5, 2), -- целевой вес
    height INTEGER, -- рост в см
    age INTEGER,
    gender VARCHAR(10), -- male/female
    activity_level VARCHAR(20), -- sedentary/light/moderate/active/very_active
    goal VARCHAR(50), -- lose_weight/maintain/gain_weight/gain_muscle
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Таблица дневника питания
CREATE TABLE IF NOT EXISTS food_diary (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type VARCHAR(50) NOT NULL, -- breakfast/lunch/dinner/snack
    product_id INTEGER REFERENCES nutrition_products(id),
    product_name VARCHAR(255), -- если продукта нет в базе
    amount DECIMAL(10, 2) NOT NULL, -- количество в граммах/мл
    calories DECIMAL(10, 2) NOT NULL,
    protein DECIMAL(10, 2) DEFAULT 0,
    fats DECIMAL(10, 2) DEFAULT 0,
    carbs DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска по дневнику
CREATE INDEX idx_food_diary_user_date ON food_diary(user_id, date);
CREATE INDEX idx_food_diary_meal_type ON food_diary(meal_type);

-- Таблица анализа питания от Кузи
CREATE TABLE IF NOT EXISTS nutrition_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    insight_type VARCHAR(50), -- warning/recommendation/achievement
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nutrition_insights_user_date ON nutrition_insights(user_id, date);