-- Добавляем Людочку (kuzmenkolv1961@mail.ru) в семью Юлии

INSERT INTO t_p5815085_family_assistant_pro.family_members (
    family_id,
    user_id,
    name,
    role,
    relationship,
    access_role,
    account_type,
    avatar,
    created_at,
    updated_at
) VALUES (
    '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a',
    '7bda5971-2de6-4b5c-852c-dca5c7ce8571',
    'Людочка',
    'Бабушка',
    'Бабушка',
    'viewer',
    'full',
    '👵',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;