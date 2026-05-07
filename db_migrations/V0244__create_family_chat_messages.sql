CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.family_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_member_id UUID NOT NULL,
    content TEXT NOT NULL,
    reactions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fam_chat_msg_conv ON t_p5815085_family_assistant_pro.family_chat_messages(conversation_id);
