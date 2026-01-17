-- Очистка семьи Юлии от дубликатов

-- 1. Делаем Вадима (voronovva1976@mail.ru) администратором
UPDATE t_p5815085_family_assistant_pro.family_members 
SET access_role = 'admin',
    relationship = 'Муж',
    role = 'Супруг',
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = '5a89a195-41aa-447e-a239-58a3058153b2'
  AND family_id = '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a';

-- 2. Обновляем Юлию - делаем её Супругой
UPDATE t_p5815085_family_assistant_pro.family_members 
SET role = 'Супруга',
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = '3b86fc3c-8b3c-4cb6-ad62-78a3830cc854'
  AND family_id = '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a';

-- 3. Обновляем Ксению - делаем дочерью
UPDATE t_p5815085_family_assistant_pro.family_members 
SET role = 'Дочь',
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = '59a8fdd9-705c-452e-8388-1c55a5654542'
  AND family_id = '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a';

-- 4. Обновляем Кирилла - исправляем имя и делаем сыном
UPDATE t_p5815085_family_assistant_pro.family_members 
SET name = 'Кирилл',
    role = 'Сын',
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = '621463d7-dfd9-47d4-90b5-9d8a6dfaacbc'
  AND family_id = '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a';

-- 5. Обновляем Людочку (kuzmenkolv1961@mail.ru) - делаем бабушкой с правами viewer
UPDATE t_p5815085_family_assistant_pro.family_members 
SET role = 'Бабушка',
    relationship = 'Бабушка',
    access_role = 'viewer',
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = '7bda5971-2de6-4b5c-852c-dca5c7ce8571'
  AND family_id = '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a';

-- 6. Помечаем дубликаты явно в имени - чтобы было видно что это надо удалить
UPDATE t_p5815085_family_assistant_pro.family_members
SET name = '[ДУБЛИКАТ - УДАЛИТЬ] ' || name,
    access_role = 'child',
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    'ab40fa23-3c53-4cef-9ea3-e62e83099da9',
    '1f097a7f-a95d-4282-9768-d18a15a8112b',
    'd4525a8e-1c96-4e87-8bdd-ace17aa43aff',
    '824ffbbd-6782-4394-bda8-1a54f3982e0f'
);