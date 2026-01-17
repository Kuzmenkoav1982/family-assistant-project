-- Переносим Людочку (kuzmenkolv1961@mail.ru) в семью Юлии (july80@mail.ru)
UPDATE t_p5815085_family_assistant_pro.family_members 
SET family_id = '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a',
    role = 'Член семьи',
    relationship = 'Сестра',
    access_role = 'admin',
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = '7bda5971-2de6-4b5c-852c-dca5c7ce8571';