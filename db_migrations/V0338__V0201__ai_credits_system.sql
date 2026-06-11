-- v1.2: AI-кредитная система
-- Добавляем поля для месячных кредитов AI
-- Кредиты — это весовые единицы, не просто счётчик запросов:
--   ai-assistant = 1 кредит
--   event-ai-ideas = 1 кредит
--   leisure-ai = 1 кредит
--   life-road = 1 кредит
--   conflict-ai = 2 кредита
--   health-ai-analysis = 2 кредита
--   diet-plan (7д/14д/30д) = 4/5/7 кредитов

ALTER TABLE t_p5815085_family_assistant_pro.subscription_usage
  ADD COLUMN IF NOT EXISTS ai_credits_used   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_credits_limit  integer NULL,          -- NULL = безлимит (старые premium)
  ADD COLUMN IF NOT EXISTS ai_credits_reset_date date NOT NULL DEFAULT DATE_TRUNC('month', CURRENT_DATE)::date,
  ADD COLUMN IF NOT EXISTS ai_credits_daily_used  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_credits_daily_reset date NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS file_storage_used_mb   numeric(10,2) NOT NULL DEFAULT 0;

-- Индекс для быстрого сброса
CREATE INDEX IF NOT EXISTS idx_sub_usage_credits_reset
  ON t_p5815085_family_assistant_pro.subscription_usage (ai_credits_reset_date);

CREATE INDEX IF NOT EXISTS idx_sub_usage_daily_reset
  ON t_p5815085_family_assistant_pro.subscription_usage (ai_credits_daily_reset);

-- Таблица весов AI-функций (настраиваемая без релиза)
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.ai_credit_weights (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL UNIQUE,
  credits       integer NOT NULL DEFAULT 1,
  description   text,
  updated_at    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p5815085_family_assistant_pro.ai_credit_weights
  (function_name, credits, description)
VALUES
  ('ai_assistant',       1, 'Общий чат-ассистент'),
  ('event_ai_ideas',     1, 'Идеи для событий'),
  ('leisure_ai',         1, 'Досуг и рестораны'),
  ('life_road',          1, 'Лайф-коуч Домовой'),
  ('conflict_ai',        2, 'Анализ конфликтов'),
  ('health_ai_analysis', 2, 'Анализ медицинских документов'),
  ('diet_plan_7d',       4, 'План питания 7 дней'),
  ('diet_plan_14d',      5, 'План питания 14 дней'),
  ('diet_plan_30d',      7, 'План питания 30 дней'),
  ('diet_recipe',        1, 'Один рецепт'),
  ('diet_photo',         2, 'Фото блюда')
ON CONFLICT (function_name) DO NOTHING;

-- Таблица лимитов по тарифам (настраиваемая без релиза)
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.plan_ai_limits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type       text NOT NULL UNIQUE,
  monthly_credits integer NULL,   -- NULL = безлимит
  daily_credits   integer NULL,   -- NULL = безлимит
  description     text,
  updated_at      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p5815085_family_assistant_pro.plan_ai_limits
  (plan_type, monthly_credits, daily_credits, description)
VALUES
  ('free_2026',       15,  3, 'Бесплатный план 2026: 15 кредитов/мес, 3/день'),
  ('premium_monthly', 30,  5, 'Премиум месяц: 30 кредитов/мес, 5/день'),
  ('premium_3m',      30,  5, 'Премиум 3 мес: 30 кредитов/мес, 5/день'),
  ('premium_6m',      30,  5, 'Премиум 6 мес: 30 кредитов/мес, 5/день'),
  ('premium_12m',     30,  5, 'Премиум 12 мес: 30 кредитов/мес, 5/день'),
  ('ai_assistant',    30,  5, 'AI-пакет: 30 кредитов/мес, 5/день'),
  ('full',            30,  5, 'Полный план: 30 кредитов/мес, 5/день'),
  ('bank_partner',    30,  5, 'Банковский партнёр: 30 кредитов/мес, 5/день')
ON CONFLICT (plan_type) DO NOTHING;
