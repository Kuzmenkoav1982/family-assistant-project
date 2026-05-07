CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.chat_reads (
    conversation_id UUID NOT NULL,
    member_id UUID NOT NULL,
    last_read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, member_id)
);
