CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.life_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id uuid NOT NULL REFERENCES t_p5815085_family_assistant_pro.families(id),
    created_by uuid REFERENCES t_p5815085_family_assistant_pro.family_members(id),
    event_date date NOT NULL,
    title varchar(255) NOT NULL,
    description text,
    category varchar(50) NOT NULL DEFAULT 'other',
    importance varchar(20) NOT NULL DEFAULT 'medium',
    participants jsonb DEFAULT '[]'::jsonb,
    photos jsonb DEFAULT '[]'::jsonb,
    is_future boolean DEFAULT false,
    mood varchar(20),
    quote text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_life_events_family ON t_p5815085_family_assistant_pro.life_events(family_id);
CREATE INDEX IF NOT EXISTS idx_life_events_date ON t_p5815085_family_assistant_pro.life_events(event_date);
CREATE INDEX IF NOT EXISTS idx_life_events_category ON t_p5815085_family_assistant_pro.life_events(category);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.life_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id uuid NOT NULL REFERENCES t_p5815085_family_assistant_pro.families(id),
    owner_id uuid REFERENCES t_p5815085_family_assistant_pro.family_members(id),
    title varchar(255) NOT NULL,
    description text,
    sphere varchar(50) NOT NULL DEFAULT 'personal',
    framework varchar(50),
    deadline date,
    status varchar(20) NOT NULL DEFAULT 'active',
    progress integer DEFAULT 0,
    steps jsonb DEFAULT '[]'::jsonb,
    ai_insights jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_life_goals_family ON t_p5815085_family_assistant_pro.life_goals(family_id);
CREATE INDEX IF NOT EXISTS idx_life_goals_owner ON t_p5815085_family_assistant_pro.life_goals(owner_id);
CREATE INDEX IF NOT EXISTS idx_life_goals_status ON t_p5815085_family_assistant_pro.life_goals(status);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.life_balance_wheel (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id uuid NOT NULL REFERENCES t_p5815085_family_assistant_pro.families(id),
    owner_id uuid REFERENCES t_p5815085_family_assistant_pro.family_members(id),
    scores jsonb NOT NULL DEFAULT '{}'::jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_life_balance_family ON t_p5815085_family_assistant_pro.life_balance_wheel(family_id);
CREATE INDEX IF NOT EXISTS idx_life_balance_owner ON t_p5815085_family_assistant_pro.life_balance_wheel(owner_id);