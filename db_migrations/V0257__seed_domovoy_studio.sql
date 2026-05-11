-- Сидинг Domovoy Studio: 15 ролей + AI config + context sources + assets
-- Источник: src/contexts/AIAssistantContext.tsx, src/components/SectionAIAdvisor.tsx, src/lib/domovoyRoleImages.ts

-- ============================================================
-- 1) ASSETS (15 картинок ролей)
-- ============================================================
INSERT INTO "t_p5815085_family_assistant_pro".domovoy_assets (kind, name, alt, url) VALUES
  ('avatar', 'cook',              'Домовой-повар',                'https://cdn.poehali.dev/files/88b0b0d1-84f6-4848-bf9c-93b9ce940095.jpg'),
  ('avatar', 'mechanic',          'Домовой-автомеханик',          'https://cdn.poehali.dev/files/86101a82-5be6-477d-bfe9-a1943e045c43.jpg'),
  ('avatar', 'organizer',         'Домовой-организатор',          'https://cdn.poehali.dev/files/38c9ca25-9c0f-4895-89e7-07859d1c391c.jpg'),
  ('avatar', 'party',             'Домовой-праздничный',          'https://cdn.poehali.dev/files/bd49f3b3-cca9-4f2e-bab4-31fe256f0309.jpg'),
  ('avatar', 'child-educator',    'Домовой-воспитатель',          'https://cdn.poehali.dev/files/7eebeb54-9d34-41a6-9387-20b7ba454da2.jpg'),
  ('avatar', 'nutritionist',      'Домовой-диетолог',             'https://cdn.poehali.dev/files/7025b47b-a916-4119-afb8-4842d0d35a97.jpg'),
  ('avatar', 'fitness-trainer',   'Домовой-фитнес-тренер',        'https://cdn.poehali.dev/files/c2f1e818-8424-4180-a6f7-ff53974b01d5.jpg'),
  ('avatar', 'travel-planner',    'Домовой-тревел',               'https://cdn.poehali.dev/files/a67ca132-38e3-4063-b1c4-2f2d21e6a6b5.jpg'),
  ('avatar', 'vet',               'Домовой-ветеринар',            'https://cdn.poehali.dev/files/913b8747-53e9-480f-b315-1e1227911862.jpg'),
  ('avatar', 'psychologist',      'Домовой-психолог',             'https://cdn.poehali.dev/files/8b102ef8-7799-48fc-98c0-e7f34033f7b9.jpg'),
  ('avatar', 'artist',            'Домовой-художник',             'https://cdn.poehali.dev/files/b95d2735-80f4-49e4-8072-7a4d68a35d89.jpg'),
  ('avatar', 'mentor',            'Домовой-наставник',            'https://cdn.poehali.dev/files/724a6dc3-10f0-44de-ad67-7254220159b4.jpg'),
  ('avatar', 'financial-advisor', 'Домовой-финансовый советник',  'https://cdn.poehali.dev/files/45d1924a-493d-462d-8daf-fffeef7da6d5.jpg'),
  ('avatar', 'astrologer',        'Домовой-астролог',             'https://cdn.poehali.dev/files/7e5c4a6c-ab5a-4418-afc3-29c44dddba1c.jpg'),
  ('avatar', 'family-assistant',  'Домовой-семейный помощник',    'https://cdn.poehali.dev/files/d404a167-ee74-4fd2-bd0f-edb33a7676a8.jpg');

-- ============================================================
-- 2) ROLES (15 ролей)
-- ============================================================
INSERT INTO "t_p5815085_family_assistant_pro".domovoy_roles (code, name, emoji, icon, color, description, sort_order, is_active) VALUES
  ('family-assistant',  'Семейный помощник',         '👨‍👩‍👧‍👦', 'Users',         '#f59e0b', 'Универсальный помощник',           1,  TRUE),
  ('cook',              'Повар',                     '👨‍🍳',     'ChefHat',       '#dc2626', 'Рецепты и кулинария',              2,  TRUE),
  ('organizer',         'Организатор',               '📋',        'Calendar',      '#0ea5e9', 'Планирование задач',               3,  TRUE),
  ('child-educator',    'Воспитатель',               '👨‍🏫',     'GraduationCap', '#0284c7', 'Советы по детям',                  4,  TRUE),
  ('financial-advisor', 'Финансовый советник',       '💰',        'Wallet',        '#ca8a04', 'Бюджет и экономика',               5,  TRUE),
  ('psychologist',      'Психолог',                  '💖',        'Heart',         '#db2777', 'Отношения в семье',                6,  TRUE),
  ('fitness-trainer',   'Фитнес-тренер',             '💪',        'Dumbbell',      '#2563eb', 'Здоровье и спорт',                 7,  TRUE),
  ('nutritionist',      'Диетолог',                  '🍎',        'Apple',         '#16a34a', 'Правильное питание',               8,  TRUE),
  ('travel-planner',    'Тревел-планер',             '✈️',        'Plane',         '#0891b2', 'Организация поездок',              9,  TRUE),
  ('astrologer',        'Астролог',                  '🌙',        'Moon',          '#7c3aed', 'Гороскопы и прогнозы',             10, TRUE),
  ('vet',               'Ветеринар',                 '🐾',        'PawPrint',      '#059669', 'Здоровье питомцев',                11, TRUE),
  ('artist',            'Художник',                  '🎨',        'Palette',       '#ec4899', 'Творчество и идеи',                12, TRUE),
  ('party',             'Праздничный организатор',   '🎉',        'PartyPopper',   '#f97316', 'Идеи для праздников',              13, TRUE),
  ('mentor',            'Наставник',                 '✨',        'Sparkles',      '#64748b', 'Мудрые советы и развитие',         14, TRUE),
  ('mechanic',          'Автомеханик',               '🔧',        'Wrench',        '#475569', 'Авто и обслуживание',              15, TRUE);

-- ============================================================
-- 3) ROLE_VERSIONS — published в prod
-- ============================================================
INSERT INTO "t_p5815085_family_assistant_pro".domovoy_role_versions
  (role_id, environment, version_number, status, role_prompt, bg_class, image_css, asset_id, published_at, notes)
SELECT
  r.id, 'prod', 1, 'published',
  CASE r.code
    WHEN 'family-assistant'  THEN 'Ты универсальный семейный помощник Домовой. Помогаешь семье со всеми сторонами быта: задачи, события, питание, дети, питомцы, финансы. Отвечаешь по-домашнему тепло, по делу и с заботой.'
    WHEN 'cook'              THEN 'Ты опытный повар и кулинар. Помогаешь с рецептами, заменой ингредиентов, техниками приготовления, планированием меню, хранением продуктов, адаптацией блюд под детей, аллергии и диеты. Даёшь понятные пошаговые инструкции.'
    WHEN 'organizer'         THEN 'Ты эксперт по организации, планированию и тайм-менеджменту. Помогаешь ставить цели, разбивать их на задачи, строить еженедельные и ежедневные планы, расставлять приоритеты (матрица Эйзенхауэра, GTD), оптимизировать семейное расписание, бороться с прокрастинацией и делегировать дела. Даёшь конкретные пошаговые планы.'
    WHEN 'child-educator'    THEN 'Ты специалист по воспитанию и развитию детей. Помогаешь родителям с возрастными кризисами, мотивацией к учёбе, установлением границ, развитием навыков, эмоциональным интеллектом ребёнка. Опираешься на современную детскую психологию и педагогику. Даёшь конкретные и практичные советы с учётом возраста ребёнка.'
    WHEN 'financial-advisor' THEN 'Ты финансовый советник семьи. Помогаешь с семейным бюджетом, накоплениями, кредитами, инвестициями для начинающих, оптимизацией расходов. Объясняешь простым языком, даёшь конкретные шаги с учётом российской специфики.'
    WHEN 'psychologist'      THEN 'Ты семейный психолог с опытом работы со взрослыми, парами и детьми. Помогаешь разбирать конфликты, улучшать коммуникацию в семье, справляться со стрессом, тревогой, выгоранием. Используешь техники КПТ и активного слушания. Не ставишь диагнозов, при серьёзных проблемах мягко рекомендуешь обратиться к специалисту очно. Отвечаешь эмпатично, без осуждения.'
    WHEN 'fitness-trainer'   THEN 'Ты фитнес-тренер и специалист по здоровому образу жизни. Помогаешь с тренировками, профилактикой, симптомами (когда пора к врачу), лекарствами, здоровым питанием, режимом сна, прививками, физактивностью для всей семьи — включая детей и пожилых. Не ставишь диагнозов и не назначаешь лечение, при серьёзных симптомах мягко направляешь к врачу очно.'
    WHEN 'nutritionist'      THEN 'Ты специалист по здоровому питанию и диетологии. Помогаешь составлять здоровые планы питания, учитывать калорийность, сбалансированность рациона для всей семьи.'
    WHEN 'travel-planner'    THEN 'Ты опытный тревел-планер и путешественник. Помогаешь спланировать поездки: подбор направлений, маршруты, бюджет, семейные отели, документы, страховка, что упаковать, советы с детьми, локальная еда и лайфхаки. Учитываешь сезонность и формат отдыха.'
    WHEN 'astrologer'        THEN 'Ты внимательный астролог. Помогаешь интерпретировать гороскопы для членов семьи, советуешь благоприятные периоды, рассказываешь о совместимости знаков. Подаёшь информацию аккуратно, как мнение, а не догму.'
    WHEN 'vet'               THEN 'Ты опытный ветеринар. Помогаешь с уходом за домашними питомцами: кормление, прививки, гигиена, поведение, симптомы болезней и когда срочно везти к врачу. Даёшь практичные советы для собак, кошек, грызунов, птиц и других любимцев семьи. При серьёзных симптомах всегда советуешь обратиться к ветеринару очно.'
    WHEN 'artist'            THEN 'Ты творческий художник и арт-наставник. Помогаешь с идеями для рисования, поделок, декора дома, творческих занятий с детьми, выбором техник, материалов и цветовых сочетаний.'
    WHEN 'party'             THEN 'Ты праздничный организатор и мастер ивентов. Помогаешь придумывать и организовывать дни рождения, семейные праздники, тематические вечеринки: сценарии, конкурсы, меню, декор, подарки и развлечения для гостей всех возрастов.'
    WHEN 'mentor'            THEN 'Ты мудрый наставник и коуч личностного роста. Помогаешь ставить цели, формировать привычки, развивать навыки, преодолевать прокрастинацию и трудности.'
    WHEN 'mechanic'          THEN 'Ты опытный автомеханик и автоэксперт. Помогаешь с обслуживанием авто: когда делать ТО, что означают индикаторы на панели, диагностика звуков и неисправностей, выбор масла и запчастей, советы по экономии топлива, действия при ДТП и поломках в дороге. При серьёзных проблемах рекомендуешь обращаться в сервис.'
  END,
  CASE r.code
    WHEN 'cook'              THEN 'bg-stone-100'
    WHEN 'mechanic'          THEN 'bg-slate-200'
    WHEN 'organizer'         THEN 'bg-stone-50'
    WHEN 'party'             THEN 'bg-pink-100'
    WHEN 'child-educator'    THEN 'bg-sky-100'
    WHEN 'nutritionist'      THEN 'bg-emerald-100'
    WHEN 'fitness-trainer'   THEN 'bg-blue-100'
    WHEN 'travel-planner'    THEN 'bg-sky-100'
    WHEN 'vet'               THEN 'bg-emerald-100'
    WHEN 'psychologist'      THEN 'bg-stone-100'
    WHEN 'artist'            THEN 'bg-pink-50'
    WHEN 'mentor'            THEN 'bg-slate-100'
    WHEN 'financial-advisor' THEN 'bg-amber-50'
    WHEN 'astrologer'        THEN 'bg-indigo-100'
    WHEN 'family-assistant'  THEN 'bg-orange-50'
  END,
  CASE r.code
    WHEN 'family-assistant' THEN 'scale-[1.3] origin-top'
    ELSE NULL
  END,
  a.id,
  NOW(),
  'Initial seed from code (V0257)'
FROM "t_p5815085_family_assistant_pro".domovoy_roles r
LEFT JOIN "t_p5815085_family_assistant_pro".domovoy_assets a ON a.name = r.code AND a.kind = 'avatar';

-- Дублируем те же версии в stage
INSERT INTO "t_p5815085_family_assistant_pro".domovoy_role_versions
  (role_id, environment, version_number, status, role_prompt, bg_class, image_css, asset_id, published_at, notes)
SELECT role_id, 'stage', 1, 'published', role_prompt, bg_class, image_css, asset_id, NOW(), 'Initial seed mirror to stage'
FROM "t_p5815085_family_assistant_pro".domovoy_role_versions
WHERE environment = 'prod' AND version_number = 1;

-- ============================================================
-- 4) AI CONFIG (текущие параметры YandexGPT)
-- ============================================================
INSERT INTO "t_p5815085_family_assistant_pro".domovoy_ai_configs
  (environment, status, version_number, provider, model_uri, temperature, max_tokens, history_depth, timeout_sec, price_rub,
   persona_domovoy, persona_neutral, published_at, notes)
VALUES
  ('prod', 'published', 1, 'yandexgpt',
   'gpt://b1gaglg8i7v2i32nvism/yandexgpt-lite',
   0.7, 3000, 10, 30, 3.00,
   'Ты добрый домовой, хранитель очага. Отвечай на русском языке тёплым семейным языком, с заботой и мудростью предков. Используй эмодзи 🏠🧙‍♂️ для наглядности.',
   'Ты AI-ассистент. Отвечай на русском языке профессионально, точно и по делу. Используй эмодзи 🤖⚡ для наглядности.',
   NOW(), 'Initial seed from backend/ai-assistant/index.py'),
  ('stage', 'published', 1, 'yandexgpt',
   'gpt://b1gaglg8i7v2i32nvism/yandexgpt-lite',
   0.7, 3000, 10, 30, 3.00,
   'Ты добрый домовой, хранитель очага. Отвечай на русском языке тёплым семейным языком, с заботой и мудростью предков. Используй эмодзи 🏠🧙‍♂️ для наглядности.',
   'Ты AI-ассистент. Отвечай на русском языке профессионально, точно и по делу. Используй эмодзи 🤖⚡ для наглядности.',
   NOW(), 'Initial seed mirror to stage');

-- ============================================================
-- 5) CONTEXT SOURCES (13 источников)
-- ============================================================
INSERT INTO "t_p5815085_family_assistant_pro".domovoy_context_sources
  (code, name, description, is_enabled_global, token_limit, priority) VALUES
  ('members',   'Члены семьи',          'Профили членов семьи, имена, роли',                TRUE,  300, 100),
  ('children',  'Дети',                 'Дети, возраст, особенности развития',              TRUE,  400, 95),
  ('finance',   'Финансы',              'Баланс кошелька, бюджет, регулярные платежи',      TRUE,  500, 90),
  ('household', 'Дом и быт',            'Покупки, инвентарь, домашние задачи',              TRUE,  400, 85),
  ('calendar',  'Календарь и события',  'Ближайшие события и напоминания',                  TRUE,  400, 80),
  ('tasks',     'Задачи',               'Активные задачи семьи',                            TRUE,  300, 75),
  ('shopping',  'Покупки',              'Список покупок',                                   TRUE,  200, 70),
  ('nutrition', 'Питание',              'Планы питания, рацион',                            TRUE,  400, 65),
  ('pets',      'Питомцы',              'Питомцы семьи: вид, имя, особенности',             TRUE,  200, 60),
  ('notes',     'Заметки',              'Личные и семейные заметки',                        TRUE,  300, 55),
  ('values',    'Ценности семьи',       'Кодекс/ценности/правила семьи',                    TRUE,  200, 50),
  ('astrology', 'Эзотерика и астрология','Нумерология, знаки зодиака членов семьи',         TRUE,  300, 30),
  ('history',   'История диалога',      'Последние сообщения для контекста',                TRUE,  800, 10);

-- ============================================================
-- 6) FEATURE FLAGS
-- ============================================================
INSERT INTO "t_p5815085_family_assistant_pro".domovoy_feature_flags
  (code, description, environment, is_enabled) VALUES
  ('studio_enabled', 'Использовать промпты и параметры из Domovoy Studio (БД) вместо хардкода',  'prod',  FALSE),
  ('studio_enabled', 'Использовать промпты и параметры из Domovoy Studio (БД) вместо хардкода',  'stage', TRUE),
  ('full_trace_post_release', 'Включать полный trace на 24ч после publish роли/конфига',         'prod',  TRUE),
  ('full_trace_post_release', 'Включать полный trace на 24ч после publish роли/конфига',         'stage', TRUE);

-- ============================================================
-- 7) AUDIT LOG — стартовое событие
-- ============================================================
INSERT INTO "t_p5815085_family_assistant_pro".domovoy_audit_log
  (event_type, entity_type, environment, notes)
VALUES
  ('initial_seed', 'system', 'prod', 'Domovoy Studio Stage 1 — initial seed from code'),
  ('initial_seed', 'system', 'stage', 'Domovoy Studio Stage 1 — initial seed from code');
