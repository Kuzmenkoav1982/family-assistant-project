-- Таблица промокодов
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'percent', 'fixed', 'free_days'
    discount_value DECIMAL(10,2) NOT NULL,
    applicable_plans TEXT[], -- NULL = все тарифы
    max_uses INTEGER, -- NULL = без лимита
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица логов действий администратора
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.admin_actions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- 'create_promo', 'edit_subscription', 'extend_subscription', etc.
    target_type VARCHAR(50), -- 'subscription', 'promo_code', 'plan', etc.
    target_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица применённых промокодов
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.promo_code_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code_id UUID REFERENCES t_p5815085_family_assistant_pro.promo_codes(id),
    family_id UUID REFERENCES t_p5815085_family_assistant_pro.families(id),
    subscription_id UUID REFERENCES t_p5815085_family_assistant_pro.subscriptions(id),
    discount_amount DECIMAL(10,2),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON t_p5815085_family_assistant_pro.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON t_p5815085_family_assistant_pro.promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_log_created ON t_p5815085_family_assistant_pro.admin_actions_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_promo_usage_family ON t_p5815085_family_assistant_pro.promo_code_usage(family_id);

COMMENT ON TABLE t_p5815085_family_assistant_pro.promo_codes IS 'Промокоды и акции для подписок';
COMMENT ON TABLE t_p5815085_family_assistant_pro.admin_actions_log IS 'Логи всех действий администраторов';
COMMENT ON TABLE t_p5815085_family_assistant_pro.promo_code_usage IS 'История применения промокодов';