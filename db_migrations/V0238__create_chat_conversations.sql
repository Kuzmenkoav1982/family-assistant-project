CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    kind VARCHAR(20) NOT NULL DEFAULT 'family',
    member_a_id UUID NULL,
    member_b_id UUID NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
