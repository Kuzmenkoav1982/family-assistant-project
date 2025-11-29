# 🗄️ База данных модуля "Дети"

## ✅ Созданные миграции

Все миграции успешно применены к базе данных:

- **V0018** - Таблицы здоровья
- **V0019** - Таблицы покупок и подарков
- **V0020** - Таблицы развития
- **V0021** - Таблицы школы
- **V0022** - Личные таблицы (мечты, дневник, копилка)

## 📊 Структура таблиц

### 1. Здоровье (Health)

#### `children_health`
Основная таблица здоровья ребёнка
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) NOT NULL  -- ID из family_members
family_id       VARCHAR(255) NOT NULL  -- ID семьи
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### `children_vaccinations`
Журнал прививок
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) NOT NULL
family_id       VARCHAR(255) NOT NULL
date            DATE NOT NULL           -- Дата прививки
vaccine         VARCHAR(255) NOT NULL   -- Название вакцины
notes           TEXT                    -- Заметки
created_at      TIMESTAMP
```

#### `children_prescriptions`
Фото рецептов от врачей
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) NOT NULL
family_id       VARCHAR(255) NOT NULL
date            DATE NOT NULL
photo_url       TEXT NOT NULL           -- URL фото рецепта
notes           TEXT
created_at      TIMESTAMP
```

#### `children_analyses`
Фото результатов анализов
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) NOT NULL
family_id       VARCHAR(255) NOT NULL
date            DATE NOT NULL
type            VARCHAR(255) NOT NULL   -- Тип анализа
photo_url       TEXT NOT NULL           -- URL фото анализа
notes           TEXT
created_at      TIMESTAMP
```

#### `children_doctor_visits`
Визиты к врачам
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) NOT NULL
family_id       VARCHAR(255) NOT NULL
date            DATE NOT NULL
doctor          VARCHAR(255) NOT NULL   -- ФИО врача
specialty       VARCHAR(255) NOT NULL   -- Специальность
status          VARCHAR(50)             -- 'planned' | 'completed'
notes           TEXT
created_at      TIMESTAMP
```

#### `children_medications`
Приём лекарств
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) NOT NULL
family_id       VARCHAR(255) NOT NULL
name            VARCHAR(255) NOT NULL   -- Название препарата
start_date      DATE NOT NULL
end_date        DATE
frequency       VARCHAR(255) NOT NULL   -- Частота приёма
dosage          VARCHAR(255) NOT NULL   -- Дозировка
instructions    TEXT                    -- Инструкции
created_at      TIMESTAMP
```

#### `children_medication_schedule`
Расписание приёма лекарств
```sql
id              SERIAL PRIMARY KEY
medication_id   INTEGER NOT NULL        -- FK к children_medications
date            DATE NOT NULL
time            TIME NOT NULL
taken           BOOLEAN DEFAULT FALSE   -- Принято или нет
created_at      TIMESTAMP
```

---

### 2. Покупки и подарки (Purchases & Gifts)

#### `children_purchase_plans`
Планы сезонных покупок
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) NOT NULL
family_id       VARCHAR(255) NOT NULL
season          VARCHAR(50) NOT NULL    -- 'winter' | 'spring' | 'summer' | 'autumn'
category        VARCHAR(255) NOT NULL   -- Категория покупок
created_at      TIMESTAMP
```

#### `children_purchase_items`
Элементы списка покупок
```sql
id              SERIAL PRIMARY KEY
plan_id         INTEGER NOT NULL        -- FK к children_purchase_plans
name            VARCHAR(255) NOT NULL
priority        VARCHAR(50)             -- 'high' | 'medium' | 'low'
estimated_cost  INTEGER
purchased       BOOLEAN DEFAULT FALSE
purchase_date   DATE
created_at      TIMESTAMP
```

#### `children_gifts`
Подарки
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) NOT NULL
family_id       VARCHAR(255) NOT NULL
event           VARCHAR(255) NOT NULL   -- Событие (День рождения, Новый год)
date            DATE NOT NULL
gift            VARCHAR(255) NOT NULL   -- Что подарить
given           BOOLEAN DEFAULT FALSE   -- Подарено или нет
notes           TEXT
created_at      TIMESTAMP
```

---

### 3. Развитие (Development)

#### `children_development`
Области развития
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) NOT NULL
family_id       VARCHAR(255) NOT NULL
area            VARCHAR(50) NOT NULL    -- 'sport' | 'education' | 'hobby' | 'social' | 'creative'
current_level   INTEGER DEFAULT 0       -- Текущий уровень 0-100
target_level    INTEGER DEFAULT 100     -- Целевой уровень
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### `children_activities`
Активности (секции, кружки, репетиторы)
```sql
id              SERIAL PRIMARY KEY
development_id  INTEGER NOT NULL        -- FK к children_development
type            VARCHAR(255) NOT NULL   -- Тип активности
name            VARCHAR(255) NOT NULL   -- Название
schedule        VARCHAR(255)            -- Расписание
cost            INTEGER                 -- Стоимость
status          VARCHAR(50)             -- 'active' | 'planned' | 'completed'
created_at      TIMESTAMP
```

#### `children_tests`
Тесты для оценки развития
```sql
id              SERIAL PRIMARY KEY
development_id  INTEGER                 -- FK к children_development (nullable)
member_id       VARCHAR(255) NOT NULL
family_id       VARCHAR(255) NOT NULL
name            VARCHAR(255) NOT NULL
description     TEXT
assigned_by     VARCHAR(255)            -- Кто назначил
assigned_date   DATE
completed_date  DATE
score           INTEGER                 -- Результат теста
reward_points   INTEGER                 -- Баллы за выполнение
status          VARCHAR(50)             -- 'available' | 'assigned' | 'completed'
created_at      TIMESTAMP
```

---

### 4. Школа (School)

#### `children_school`
Основная таблица школьных данных
```sql
id                  SERIAL PRIMARY KEY
member_id           VARCHAR(255) UNIQUE -- ID из family_members
family_id           VARCHAR(255) NOT NULL
mesh_integration    BOOLEAN DEFAULT FALSE -- Интеграция с МЭШ
current_grade       VARCHAR(50)          -- Текущий класс
school_name         VARCHAR(255)
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

#### `children_grades`
Оценки по предметам
```sql
id              SERIAL PRIMARY KEY
school_id       INTEGER NOT NULL        -- FK к children_school
subject         VARCHAR(255) NOT NULL   -- Предмет
grade           INTEGER NOT NULL        -- Оценка
date            DATE NOT NULL
notes           TEXT
created_at      TIMESTAMP
```

#### `children_homework`
Домашние задания
```sql
id              SERIAL PRIMARY KEY
school_id       INTEGER NOT NULL        -- FK к children_school
subject         VARCHAR(255) NOT NULL
title           VARCHAR(255) NOT NULL
description     TEXT
due_date        DATE NOT NULL           -- Срок сдачи
completed       BOOLEAN DEFAULT FALSE
completed_date  DATE
created_at      TIMESTAMP
```

---

### 5. Личные данные (Personal)

#### `children_dreams`
Мечты ребёнка
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) NOT NULL
family_id       VARCHAR(255) NOT NULL
title           VARCHAR(255) NOT NULL
description     TEXT
created_date    DATE DEFAULT CURRENT_DATE
achieved        BOOLEAN DEFAULT FALSE
achieved_date   DATE
created_at      TIMESTAMP
```

#### `children_diary`
Дневник ребёнка
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) NOT NULL
family_id       VARCHAR(255) NOT NULL
date            DATE DEFAULT CURRENT_DATE
title           VARCHAR(255)
content         TEXT NOT NULL
mood            VARCHAR(50)             -- Настроение
created_at      TIMESTAMP
```

#### `children_piggybank`
Копилка ребёнка
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) UNIQUE     -- ID из family_members
family_id       VARCHAR(255) NOT NULL
balance         INTEGER DEFAULT 0       -- Баланс в копейках/рублях
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### `children_transactions`
Транзакции копилки
```sql
id              SERIAL PRIMARY KEY
piggybank_id    INTEGER NOT NULL        -- FK к children_piggybank
date            DATE DEFAULT CURRENT_DATE
amount          INTEGER NOT NULL        -- Сумма (+ или -)
type            VARCHAR(50) NOT NULL    -- 'income' | 'expense'
description     TEXT NOT NULL
created_at      TIMESTAMP
```

#### `children_achievements`
Достижения ребёнка
```sql
id              SERIAL PRIMARY KEY
member_id       VARCHAR(255) NOT NULL
family_id       VARCHAR(255) NOT NULL
title           VARCHAR(255) NOT NULL
description     TEXT
icon            VARCHAR(50)             -- Иконка достижения
date_earned     DATE DEFAULT CURRENT_DATE
points          INTEGER DEFAULT 0       -- Баллы за достижение
created_at      TIMESTAMP
```

---

## 🔍 Индексы

Созданы индексы для оптимизации запросов:

- По `member_id` и `family_id` для всех таблиц
- По датам для временных данных
- По статусам для фильтрации
- По внешним ключам для JOIN операций

## 🔗 Связи между таблицами

```
family_members (существующая)
    ↓ (member_id)
    ├── children_health
    ├── children_vaccinations
    ├── children_prescriptions
    ├── children_analyses
    ├── children_doctor_visits
    ├── children_medications
    │       ↓ (medication_id)
    │       └── children_medication_schedule
    │
    ├── children_purchase_plans
    │       ↓ (plan_id)
    │       └── children_purchase_items
    │
    ├── children_gifts
    │
    ├── children_development
    │       ↓ (development_id)
    │       ├── children_activities
    │       └── children_tests
    │
    ├── children_school
    │       ↓ (school_id)
    │       ├── children_grades
    │       └── children_homework
    │
    ├── children_dreams
    ├── children_diary
    ├── children_piggybank
    │       ↓ (piggybank_id)
    │       └── children_transactions
    │
    └── children_achievements
```

## 📝 Примеры запросов

### Получить все прививки ребёнка
```sql
SELECT * FROM children_vaccinations
WHERE member_id = 'child-123' AND family_id = 'family-456'
ORDER BY date DESC;
```

### Получить незавершённые покупки на зиму
```sql
SELECT cpi.* 
FROM children_purchase_items cpi
JOIN children_purchase_plans cpp ON cpi.plan_id = cpp.id
WHERE cpp.member_id = 'child-123' 
  AND cpp.season = 'winter'
  AND cpi.purchased = FALSE
ORDER BY cpi.priority DESC;
```

### Средний балл по всем предметам
```sql
SELECT AVG(grade) as average_grade
FROM children_grades cg
JOIN children_school cs ON cg.school_id = cs.id
WHERE cs.member_id = 'child-123';
```

### Баланс копилки с последними транзакциями
```sql
SELECT 
    cp.balance,
    ct.date,
    ct.amount,
    ct.type,
    ct.description
FROM children_piggybank cp
LEFT JOIN children_transactions ct ON ct.piggybank_id = cp.id
WHERE cp.member_id = 'child-123'
ORDER BY ct.date DESC
LIMIT 10;
```

## 🚀 Следующие шаги

1. ✅ Миграции созданы и применены
2. ⏳ Обновить backend функцию `children-data` для работы с БД
3. ⏳ Обновить хук `useChildrenData` для реальных данных
4. ⏳ Добавить триггеры для автоматического обновления `updated_at`
5. ⏳ Добавить ограничения внешних ключей (FK constraints)

## 🔐 Безопасность

- Все запросы должны фильтроваться по `family_id` для изоляции данных
- Backend проверяет права доступа через `X-Auth-Token`
- Чувствительные данные (фото) хранятся по URL, не в БД напрямую

---

**Статус БД**: ✅ Готова к использованию
**Всего таблиц**: 22
**Миграции**: V0018 - V0022
