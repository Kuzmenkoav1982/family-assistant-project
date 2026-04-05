CREATE TABLE t_p5815085_family_assistant_pro.clans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    created_by uuid NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_p5815085_family_assistant_pro.clan_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clan_id uuid NOT NULL REFERENCES t_p5815085_family_assistant_pro.clans(id),
    family_id text NOT NULL,
    user_id uuid NOT NULL,
    role varchar(50) NOT NULL DEFAULT 'member',
    status varchar(20) NOT NULL DEFAULT 'pending',
    invited_by uuid,
    joined_at timestamp,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clan_id, family_id)
);

ALTER TABLE t_p5815085_family_assistant_pro.family_tree ADD COLUMN clan_id uuid REFERENCES t_p5815085_family_assistant_pro.clans(id);