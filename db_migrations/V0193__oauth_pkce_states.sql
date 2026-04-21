CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.oauth_pkce_states (
    id SERIAL PRIMARY KEY,
    state_key VARCHAR(64) UNIQUE NOT NULL,
    code_verifier TEXT NOT NULL,
    frontend_url TEXT NOT NULL,
    provider VARCHAR(20) NOT NULL DEFAULT 'vk',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_pkce_states_key ON t_p5815085_family_assistant_pro.oauth_pkce_states(state_key);
CREATE INDEX IF NOT EXISTS idx_oauth_pkce_states_expires ON t_p5815085_family_assistant_pro.oauth_pkce_states(expires_at);