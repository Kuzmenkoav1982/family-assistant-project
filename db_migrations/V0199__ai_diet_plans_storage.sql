-- Таблица для хранения сгенерированных ИИ-планов питания
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.ai_diet_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    family_id uuid,
    duration_days integer NOT NULL DEFAULT 7,
    plan_data jsonb NOT NULL,
    quiz_data jsonb,
    program_data jsonb,
    operation_id varchar(100),
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_diet_plans_user ON t_p5815085_family_assistant_pro.ai_diet_plans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_diet_plans_family ON t_p5815085_family_assistant_pro.ai_diet_plans(family_id, created_at DESC);
