-- =============================================================================
-- ПОРТФОЛИО ЧЛЕНА СЕМЬИ — модуль развития
-- 8 сфер: intellect, emotions, body, creativity, social, finance, values, life_skills
-- 6 возрастных групп: 0-3, 4-6, 7-10, 11-14, 15-17, 18+
-- =============================================================================

-- 1. Текущий снимок портфолио (одна строка на участника)
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.member_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL UNIQUE,
    family_id UUID NOT NULL,
    age_group VARCHAR(10) NOT NULL,
    current_scores JSONB NOT NULL DEFAULT '{}',
    confidence_scores JSONB NOT NULL DEFAULT '{}',
    strengths JSONB NOT NULL DEFAULT '[]',
    growth_zones JSONB NOT NULL DEFAULT '[]',
    next_actions JSONB NOT NULL DEFAULT '[]',
    completeness INTEGER NOT NULL DEFAULT 0,
    last_aggregated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    visibility_settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolios_member ON t_p5815085_family_assistant_pro.member_portfolios(member_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_family ON t_p5815085_family_assistant_pro.member_portfolios(family_id);

-- 2. История срезов (snapshot по milestone-событиям и cron)
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.member_portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    family_id UUID NOT NULL,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    snapshot_type VARCHAR(50) NOT NULL DEFAULT 'monthly',
    age_group VARCHAR(10) NOT NULL,
    scores JSONB NOT NULL DEFAULT '{}',
    confidence JSONB NOT NULL DEFAULT '{}',
    metrics JSONB NOT NULL DEFAULT '{}',
    summary JSONB NOT NULL DEFAULT '{}',
    source_count INTEGER NOT NULL DEFAULT 0,
    trigger_event VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_snapshots_member ON t_p5815085_family_assistant_pro.member_portfolio_snapshots(member_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON t_p5815085_family_assistant_pro.member_portfolio_snapshots(member_id, snapshot_date DESC);

-- 3. Нормализованные метрики по сферам с источниками
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.member_portfolio_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    sphere_key VARCHAR(50) NOT NULL,
    metric_key VARCHAR(100) NOT NULL,
    metric_value NUMERIC,
    metric_unit VARCHAR(50),
    source_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(255),
    measured_at TIMESTAMP NOT NULL,
    confidence NUMERIC DEFAULT 1.0,
    raw_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_metrics_member_sphere ON t_p5815085_family_assistant_pro.member_portfolio_metrics(member_id, sphere_key);
CREATE INDEX IF NOT EXISTS idx_metrics_measured ON t_p5815085_family_assistant_pro.member_portfolio_metrics(measured_at DESC);

-- 4. Единая стена достижений (для детей и взрослых)
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.member_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    family_id UUID NOT NULL,
    badge_key VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NOT NULL DEFAULT 'Award',
    sphere_key VARCHAR(50),
    category VARCHAR(50) NOT NULL DEFAULT 'milestone',
    earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_type VARCHAR(50),
    source_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_achievements_member ON t_p5815085_family_assistant_pro.member_achievements(member_id, earned_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_achievements_unique ON t_p5815085_family_assistant_pro.member_achievements(member_id, badge_key);

-- 5. Планы развития по сферам
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.member_development_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    family_id UUID NOT NULL,
    sphere_key VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    milestone TEXT,
    target_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    progress INTEGER NOT NULL DEFAULT 0,
    next_step TEXT,
    owner_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plans_member ON t_p5815085_family_assistant_pro.member_development_plans(member_id, status);

-- 6. Rule-based и AI-инсайты с привязкой к snapshot
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.portfolio_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    snapshot_id UUID,
    insight_type VARCHAR(50) NOT NULL,
    sphere_key VARCHAR(50),
    severity VARCHAR(20) NOT NULL DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    suggestion TEXT,
    generated_by VARCHAR(20) NOT NULL DEFAULT 'rule',
    rule_key VARCHAR(100),
    is_dismissed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_insights_member ON t_p5815085_family_assistant_pro.portfolio_insights(member_id, created_at DESC);

-- 7. Справочник правил: возраст × сфера → ожидаемые метрики и формулы
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.sphere_metric_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    age_group VARCHAR(10) NOT NULL,
    sphere_key VARCHAR(50) NOT NULL,
    metric_key VARCHAR(100) NOT NULL,
    metric_label VARCHAR(255) NOT NULL,
    metric_group VARCHAR(50) NOT NULL,
    weight NUMERIC NOT NULL DEFAULT 1.0,
    expected_count INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rules_unique ON t_p5815085_family_assistant_pro.sphere_metric_rules(age_group, sphere_key, metric_key);

-- =============================================================================
-- НАЧАЛЬНЫЕ ПРАВИЛА для возрастной группы 4-6 (дошкольник)
-- metric_group: objective | activity | goals | self_report
-- =============================================================================

-- INTELLECT (4-6): развитие речи, логика, память
INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description) VALUES
    ('4-6', 'intellect', 'development_assessment', 'Оценка развития (тест)', 'objective', 0.5, 1, 'Прохождение детского теста развития'),
    ('4-6', 'intellect', 'cognitive_skills', 'Когнитивные навыки', 'objective', 0.3, 5, 'Память, внимание, логика'),
    ('4-6', 'intellect', 'curiosity_activities', 'Познавательная активность', 'activity', 0.15, 3, 'Чтение, развивающие занятия'),
    ('4-6', 'intellect', 'parent_observation', 'Наблюдения родителя', 'self_report', 0.05, 1, 'Самооценка родителя');

-- EMOTIONS (4-6): распознавание эмоций, регуляция
INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description) VALUES
    ('4-6', 'emotions', 'emotion_recognition', 'Распознавание эмоций', 'objective', 0.2, 1, 'Тест на эмоциональный интеллект'),
    ('4-6', 'emotions', 'mood_diary', 'Дневник настроения', 'activity', 0.3, 7, 'Регулярные записи настроения'),
    ('4-6', 'emotions', 'emotion_goals', 'Цели по эмоциям', 'goals', 0.2, 1, 'План по развитию эмоций'),
    ('4-6', 'emotions', 'parent_emotion_score', 'Оценка родителя', 'self_report', 0.3, 1, 'Наблюдение родителя за эмоциями');

-- BODY (4-6): рост, вес, активность, прививки
INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description) VALUES
    ('4-6', 'body', 'height_weight', 'Рост и вес', 'objective', 0.3, 2, 'Свежие измерения роста и веса'),
    ('4-6', 'body', 'vaccinations', 'Прививки по календарю', 'objective', 0.2, 3, 'Прививки по возрасту'),
    ('4-6', 'body', 'doctor_visits', 'Визиты к врачу', 'objective', 0.1, 1, 'Регулярные осмотры'),
    ('4-6', 'body', 'physical_activity', 'Физическая активность', 'activity', 0.25, 2, 'Спортивные кружки, прогулки'),
    ('4-6', 'body', 'health_goals', 'Цели по здоровью', 'goals', 0.1, 1, 'План по физическому развитию'),
    ('4-6', 'body', 'parent_health_score', 'Оценка родителя', 'self_report', 0.05, 1, 'Самочувствие ребёнка глазами родителя');

-- CREATIVITY (4-6): рисунок, музыка, фантазия
INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description) VALUES
    ('4-6', 'creativity', 'creative_skills', 'Творческие навыки', 'objective', 0.1, 3, 'Оценка творческих способностей'),
    ('4-6', 'creativity', 'creative_activities', 'Творческие занятия', 'activity', 0.5, 2, 'Кружки, рисование, музыка'),
    ('4-6', 'creativity', 'creative_achievements', 'Творческие достижения', 'goals', 0.2, 1, 'Работы, грамоты, выступления'),
    ('4-6', 'creativity', 'parent_creativity_score', 'Оценка родителя', 'self_report', 0.2, 1, 'Фантазия и творческость глазами родителя');

-- SOCIAL (4-6): дружба, сотрудничество, общение
INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description) VALUES
    ('4-6', 'social', 'social_skills', 'Социальные навыки', 'objective', 0.25, 3, 'Оценка навыков общения'),
    ('4-6', 'social', 'group_activities', 'Групповые активности', 'activity', 0.4, 2, 'Кружки, друзья, совместные игры'),
    ('4-6', 'social', 'social_goals', 'Социальные цели', 'goals', 0.15, 1, 'План по социализации'),
    ('4-6', 'social', 'parent_social_score', 'Оценка родителя', 'self_report', 0.2, 1, 'Общительность глазами родителя');

-- FINANCE (4-6): первое знакомство с деньгами
INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description) VALUES
    ('4-6', 'finance', 'money_concepts', 'Понимание денег', 'objective', 0.2, 1, 'Базовые понятия о деньгах'),
    ('4-6', 'finance', 'piggybank_activity', 'Копилка', 'activity', 0.4, 1, 'Опыт копить деньги'),
    ('4-6', 'finance', 'finance_goals', 'Финансовые цели', 'goals', 0.3, 1, 'Цели накопления'),
    ('4-6', 'finance', 'parent_finance_score', 'Оценка родителя', 'self_report', 0.1, 1, 'Понимание ценности вещей');

-- VALUES (4-6): семейные ритуалы, доброта, эмпатия
INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description) VALUES
    ('4-6', 'values', 'values_concepts', 'Понимание правил семьи', 'objective', 0.1, 1, 'Знание семейных ценностей'),
    ('4-6', 'values', 'family_rituals', 'Участие в ритуалах', 'activity', 0.5, 3, 'Семейные традиции, обеды, праздники'),
    ('4-6', 'values', 'values_goals', 'Цели по ценностям', 'goals', 0.2, 1, 'План воспитания характера'),
    ('4-6', 'values', 'parent_values_score', 'Оценка родителя', 'self_report', 0.2, 1, 'Доброта, эмпатия глазами родителя');

-- LIFE_SKILLS (4-6): самостоятельность, бытовые навыки
INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description) VALUES
    ('4-6', 'life_skills', 'self_care_skills', 'Навыки самообслуживания', 'objective', 0.2, 5, 'Одеваться, есть, мыться'),
    ('4-6', 'life_skills', 'household_tasks', 'Домашние задания', 'activity', 0.6, 2, 'Помощь по дому, рутины'),
    ('4-6', 'life_skills', 'life_skills_goals', 'Цели самостоятельности', 'goals', 0.15, 1, 'План развития самостоятельности'),
    ('4-6', 'life_skills', 'parent_life_skills_score', 'Оценка родителя', 'self_report', 0.05, 1, 'Самостоятельность глазами родителя');
