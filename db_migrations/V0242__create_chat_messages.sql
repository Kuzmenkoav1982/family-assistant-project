CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_member_id UUID NOT NULL,
    content TEXT NOT NULL,
    reactions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
