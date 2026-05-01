-- Разделы для каждого хаба (по 4 раздела)

INSERT INTO t_p5815085_family_assistant_pro.dashboard_sections (hub_id, slug, title, icon, route, position)
SELECT h.id, s.slug, s.title, s.icon, s.route, s.position FROM t_p5815085_family_assistant_pro.dashboard_hubs h
CROSS JOIN LATERAL (VALUES
  ('profiles',      'Профили',         'UserCircle', '/family-hub#profiles',      0),
  ('tree',          'Древо',           'GitBranch',  '/tree',                     1),
  ('members',       'Участники',       'Users',      '/family-management',        2),
  ('invite',        'Приглашения',     'UserPlus',   '/family-invite',            3)
) AS s(slug, title, icon, route, position)
WHERE h.slug = 'family'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.dashboard_sections (hub_id, slug, title, icon, route, position)
SELECT h.id, s.slug, s.title, s.icon, s.route, s.position FROM t_p5815085_family_assistant_pro.dashboard_hubs h
CROSS JOIN LATERAL (VALUES
  ('checkups',      'Чекапы',          'Stethoscope', '/health-hub#checkups',     0),
  ('medications',   'Лекарства',       'Pill',        '/health-hub#medications',  1),
  ('records',       'Карты здоровья',  'FileHeart',   '/health-hub#records',      2),
  ('activity',      'Активность',      'Activity',    '/health-hub#activity',     3)
) AS s(slug, title, icon, route, position)
WHERE h.slug = 'health'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.dashboard_sections (hub_id, slug, title, icon, route, position)
SELECT h.id, s.slug, s.title, s.icon, s.route, s.position FROM t_p5815085_family_assistant_pro.dashboard_hubs h
CROSS JOIN LATERAL (VALUES
  ('menu',          'Меню недели',     'UtensilsCrossed', '/meals',               0),
  ('recipes',       'Рецепты',         'BookOpen',        '/recipes',             1),
  ('shopping',      'Список покупок',  'ShoppingCart',    '/shopping',            2),
  ('diet',          'Диеты',           'Salad',           '/diet-program-catalog',3)
) AS s(slug, title, icon, route, position)
WHERE h.slug = 'nutrition'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.dashboard_sections (hub_id, slug, title, icon, route, position)
SELECT h.id, s.slug, s.title, s.icon, s.route, s.position FROM t_p5815085_family_assistant_pro.dashboard_hubs h
CROSS JOIN LATERAL (VALUES
  ('values',        'Ценности семьи',  'Heart',      '/values',                  0),
  ('rules',         'Правила',         'ScrollText', '/family-rules',            1),
  ('faith',         'Вера',            'Sparkle',    '/faith',                   2),
  ('culture',       'Культура',        'Landmark',   '/culture',                 3)
) AS s(slug, title, icon, route, position)
WHERE h.slug = 'values'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.dashboard_sections (hub_id, slug, title, icon, route, position)
SELECT h.id, s.slug, s.title, s.icon, s.route, s.position FROM t_p5815085_family_assistant_pro.dashboard_hubs h
CROSS JOIN LATERAL (VALUES
  ('calendar',      'Календарь встреч','Calendar',     '/calendar',              0),
  ('council',       'Семейный совет',  'MessagesSquare','/voting',               1),
  ('tasks',         'Задачи на неделю','ClipboardList','/family-tasks',          2),
  ('goals',         'Цели',            'Target',       '/goals',                 3)
) AS s(slug, title, icon, route, position)
WHERE h.slug = 'planning'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.dashboard_sections (hub_id, slug, title, icon, route, position)
SELECT h.id, s.slug, s.title, s.icon, s.route, s.position FROM t_p5815085_family_assistant_pro.dashboard_hubs h
CROSS JOIN LATERAL (VALUES
  ('budget',        'Бюджет',          'PiggyBank',   '/finance/budget',         0),
  ('goals_fin',     'Финансовые цели', 'Trophy',      '/finance/goals',          1),
  ('debts',         'Долги',           'CreditCard',  '/finance/debts',          2),
  ('analytics',     'Аналитика',       'TrendingUp',  '/finance/analytics',      3)
) AS s(slug, title, icon, route, position)
WHERE h.slug = 'finance'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.dashboard_sections (hub_id, slug, title, icon, route, position)
SELECT h.id, s.slug, s.title, s.icon, s.route, s.position FROM t_p5815085_family_assistant_pro.dashboard_hubs h
CROSS JOIN LATERAL (VALUES
  ('home_tasks',    'Домашние дела',   'Home',        '/household-hub#tasks',    0),
  ('garage',        'Техника',         'Car',         '/garage',                 1),
  ('purchases',     'Покупки',         'ShoppingBag', '/purchases',              2),
  ('storage',       'Хранение',        'Package',     '/household-hub#storage',  3)
) AS s(slug, title, icon, route, position)
WHERE h.slug = 'household'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.dashboard_sections (hub_id, slug, title, icon, route, position)
SELECT h.id, s.slug, s.title, s.icon, s.route, s.position FROM t_p5815085_family_assistant_pro.dashboard_hubs h
CROSS JOIN LATERAL (VALUES
  ('trips',         'Поездки',         'Plane',       '/trips',                  0),
  ('wishlist',      'Список желаний',  'Heart',       '/trip-wishlist',          1),
  ('leisure',       'Досуг',           'Sparkles',    '/leisure',                2),
  ('history',       'История поездок', 'History',     '/location-history',       3)
) AS s(slug, title, icon, route, position)
WHERE h.slug = 'leisure'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.dashboard_sections (hub_id, slug, title, icon, route, position)
SELECT h.id, s.slug, s.title, s.icon, s.route, s.position FROM t_p5815085_family_assistant_pro.dashboard_hubs h
CROSS JOIN LATERAL (VALUES
  ('education',     'Образование',     'GraduationCap','/education',             0),
  ('children',      'Дети',            'Baby',        '/children',               1),
  ('hobbies',       'Хобби',           'Palette',     '/development-hub#hobbies',2),
  ('liferoad',      'Путь жизни',      'Compass',     '/life-road',              3)
) AS s(slug, title, icon, route, position)
WHERE h.slug = 'development'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.dashboard_sections (hub_id, slug, title, icon, route, position)
SELECT h.id, s.slug, s.title, s.icon, s.route, s.position FROM t_p5815085_family_assistant_pro.dashboard_hubs h
CROSS JOIN LATERAL (VALUES
  ('couple_code',   'Код пары',        'Heart',       '/family-matrix-couple',   0),
  ('family_code',   'Код семьи',       'Users',       '/family-matrix-family',   1),
  ('rituals',       'Ритуалы примирения','Sparkles',  '/family-matrix-rituals',  2),
  ('child_code',    'Детский код',     'Baby',        '/family-matrix-child',    3)
) AS s(slug, title, icon, route, position)
WHERE h.slug = 'family-code'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.dashboard_sections (hub_id, slug, title, icon, route, position)
SELECT h.id, s.slug, s.title, s.icon, s.route, s.position FROM t_p5815085_family_assistant_pro.dashboard_hubs h
CROSS JOIN LATERAL (VALUES
  ('pets_list',     'Питомцы',         'PawPrint',    '/pets#list',              0),
  ('pet_health',    'Здоровье',        'HeartPulse',  '/pets#health',            1),
  ('pet_food',      'Питание',         'Bone',        '/pets#food',              2),
  ('pet_care',      'Уход',            'Sparkles',    '/pets#care',              3)
) AS s(slug, title, icon, route, position)
WHERE h.slug = 'pets'
ON CONFLICT DO NOTHING;
