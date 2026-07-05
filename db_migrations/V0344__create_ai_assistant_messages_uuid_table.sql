CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.ai_assistant_messages (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id uuid NOT NULL,
    user_id uuid NULL,
    role varchar(20) NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_assistant_messages_family_created
    ON t_p5815085_family_assistant_pro.ai_assistant_messages (family_id, created_at DESC);