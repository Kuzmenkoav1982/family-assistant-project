-- Привязка тегов к постам по семантическому соответствию

WITH tag_mapping AS (
  SELECT p.id AS post_id, t.id AS tag_id
  FROM t_p5815085_family_assistant_pro.public_blog_posts p
  CROSS JOIN t_p5815085_family_assistant_pro.public_blog_tags t
  WHERE
    -- Юмор и смех
    (p.slug IN ('smeh-luchshee-lekarstvo', 'semeyniy-yumor-zachem-smeyatsya-vmeste') AND t.slug IN ('yumor', 'semya', 'deti', 'nauka', 'otnosheniya'))
    OR
    -- Чтение
    (p.slug = 'chtenie-vsluh-pochemu-eto-rabotaet' AND t.slug IN ('deti', 'razvitie', 'tradicii', 'shkola', 'nauka'))
    OR
    -- Привязанность
    (p.slug = 'bezuslovnaya-lyubov-privyazannost' AND t.slug IN ('deti', 'psihologiya', 'vospitanie', 'emocii', 'nauka'))
    OR
    -- Микробиом
    (p.slug = 'mikrobiom-vesnoy-zdorove-semi' AND t.slug IN ('zdorove', 'pitanie', 'semya', 'nauka', 'deti'))
    OR
    -- Безопасность данных
    (p.slug = 'bezopasnost-dannyh-semi-2026' AND t.slug IN ('bezopasnost', 'deti', 'semya'))
    OR
    -- Творчество
    (p.slug = 'tvorchestvo-bez-pravil-kreativnost' AND t.slug IN ('deti', 'razvitie', 'vospitanie', 'nauka'))
    OR
    -- Природа и дети
    (p.slug = 'priroda-i-deti-ekologicheskoe-vospitanie' AND t.slug IN ('priroda', 'deti', 'vospitanie', 'razvitie', 'tradicii'))
    OR
    -- Стресс
    (p.slug = 'upravlenie-stressom-test-dlya-semi' AND t.slug IN ('psihologiya', 'emocii', 'semya', 'konflikty'))
    OR
    -- ИИ-диета
    (p.slug = 'ii-dieta-personalnoe-pitanie' AND t.slug IN ('pitanie', 'zdorove', 'semya'))
    OR
    -- Досуг
    (p.slug = 'semeyniy-dosug-idei-na-vyhodnye' AND t.slug IN ('semya', 'tradicii', 'deti'))
    OR
    -- Семейная история болезней
    (p.slug = 'semeynaya-istoriya-bolezney' AND t.slug IN ('zdorove', 'semya', 'nauka'))
    OR
    -- Раскраски
    (p.slug = 'raskraski-dlya-vzroslyh-i-detey' AND t.slug IN ('deti', 'psihologiya', 'tradicii'))
    OR
    -- Голосования
    (p.slug = 'semeynaya-demokratiya-golosovaniya' AND t.slug IN ('semya', 'deti', 'konflikty', 'vospitanie'))
    OR
    -- Воскресный совет
    (p.slug IN ('voskresniy-sovet-itogi-aprelya', 'voskresniy-sovet-mayskie-vyhodnye') AND t.slug IN ('tradicii', 'semya'))
    OR
    -- Целеполагание
    (p.slug = 'tselepolaganie-v-seme-mechtayte-vmeste' AND t.slug IN ('semya', 'razvitie', 'finansy'))
    OR
    -- Домовой
    (p.slug = 'domovoy-ii-pomoschnik-semi' AND t.slug IN ('deti', 'psihologiya', 'vospitanie'))
    OR
    -- Алиса
    (p.slug = 'alisa-rasskazhi-pro-semyu-golos' AND t.slug IN ('semya', 'deti'))
    OR
    -- Эмоциональная безопасность
    (p.slug = 'emocionalnaya-bezopasnost-doma' AND t.slug IN ('emocii', 'psihologiya', 'deti', 'vospitanie', 'semya'))
    OR
    -- Хронотипы
    (p.slug = 'upravlenie-vremenem-v-seme-hronotipy' AND t.slug IN ('son', 'semya', 'psihologiya', 'nauka'))
    OR
    -- Майские
    (p.slug IN ('kanun-mayskih-planiruem-vyhodnye', 'mayskie-kanikuly-tri-strategii') AND t.slug IN ('mayskie', 'puteshestviya', 'semya', 'prazdniki'))
    OR
    -- Обратная связь
    (p.slug = 'obratnaya-svyaz-vashi-idei-formiruyut' AND t.slug IN ('semya', 'razvitie'))
    OR
    -- Невидимый труд
    (p.slug = 'den-truda-trud-v-seme-2026' AND t.slug IN ('otnosheniya', 'brak', 'semya', 'psihologiya'))
    OR
    -- Шашлык
    (p.slug = 'shashlyk-kak-semeynyy-ritual' AND t.slug IN ('mayskie', 'tradicii', 'semya', 'priroda'))
    OR
    -- Безопасность природа
    (p.slug = 'bezopasnost-na-prirode-deti' AND t.slug IN ('bezopasnost', 'deti', 'priroda', 'mayskie'))
    OR
    -- День рождения
    (p.slug = 'den-rozhdeniya-rebenka-prazdnik-dlya-kogo' AND t.slug IN ('prazdniki', 'deti', 'psihologiya'))
    OR
    -- Огород
    (p.slug = 'ogorod-i-dacha-vospitanie-cherez-zemlyu' AND t.slug IN ('deti', 'priroda', 'vospitanie', 'pitanie', 'tradicii'))
    OR
    -- Языки любви
    (p.slug = 'yazyki-lyubvi-v-seme-polnaya-karta' AND t.slug IN ('otnosheniya', 'brak', 'psihologiya'))
    OR
    -- Конец учебного года
    (p.slug = 'konec-uchebnogo-goda-bez-stressa' AND t.slug IN ('shkola', 'deti', 'psihologiya', 'emocii'))
    OR
    -- Мудрость народов
    (p.slug = 'mudrost-narodov-rossii-semya' AND t.slug IN ('tradicii', 'vospitanie', 'semya'))
    OR
    -- Мастерская жизни
    (p.slug = 'masterskaya-zhizni-noviy-razdel' AND t.slug IN ('razvitie', 'psihologiya'))
    OR
    -- Итоги апреля
    (p.slug = 'spasibo-chto-vy-s-nami-itogi-aprelya' AND t.slug IN ('semya', 'tradicii'))
)
INSERT INTO t_p5815085_family_assistant_pro.public_blog_post_tags (post_id, tag_id)
SELECT post_id, tag_id FROM tag_mapping
ON CONFLICT DO NOTHING;

-- Обновляем счётчики категорий
UPDATE t_p5815085_family_assistant_pro.public_blog_categories c
SET posts_count = (
  SELECT COUNT(*) FROM t_p5815085_family_assistant_pro.public_blog_posts p
  WHERE p.category_id = c.id AND p.status = 'published'
);

-- Обновляем счётчики тегов
UPDATE t_p5815085_family_assistant_pro.public_blog_tags t
SET posts_count = (
  SELECT COUNT(*) FROM t_p5815085_family_assistant_pro.public_blog_post_tags pt
  WHERE pt.tag_id = t.id
);
