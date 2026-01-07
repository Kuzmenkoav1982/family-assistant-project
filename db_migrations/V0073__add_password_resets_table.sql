-- Create password_resets table for email-based password recovery
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.password_resets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    reset_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON t_p5815085_family_assistant_pro.password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_code ON t_p5815085_family_assistant_pro.password_resets(reset_code);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON t_p5815085_family_assistant_pro.password_resets(expires_at);