CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_category VARCHAR(50) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON t_p5815085_family_assistant_pro.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_action_type ON t_p5815085_family_assistant_pro.security_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON t_p5815085_family_assistant_pro.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_category ON t_p5815085_family_assistant_pro.security_audit_log(action_category);