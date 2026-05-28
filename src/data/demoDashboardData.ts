import type { DashboardData } from '@/components/dashboard/types';

/**
 * Демо-данные дашборда — "живая" активная семья Кузнецовых.
 * Большинство разделов заполнены на 60-90%, некоторые на 100% — реалистично.
 */
export const demoDashboardData: DashboardData = {
  family_id: 'demo-family',
  stats: {
    overall_progress: 68,
    active_hubs: 10,
    total_hubs: 11,
    completed_sections: 18,
    total_sections: 44,
  },
  hubs: [
    {
      id: 1, slug: 'family', title: 'Семья', icon: 'Users', color: '#ec4899',
      route: '/family-management', position: 1, scope: 'family',
      progress: 75, total_sections: 4, completed_sections: 3,
      sections: [
        { id: 101, hub_id: 1, slug: 'profiles', title: 'Профили', icon: 'User', route: '/family-management', position: 1, progress: 100, completed_steps: 4, total_steps: 4, steps: [
          { id: 1001, section_id: 101, slug: 'add_members', title: 'Добавить членов семьи', position: 1, completed: true },
          { id: 1002, section_id: 101, slug: 'photos', title: 'Загрузить фотографии', position: 2, completed: true },
          { id: 1003, section_id: 101, slug: 'roles', title: 'Указать роли', position: 3, completed: true },
          { id: 1004, section_id: 101, slug: 'birthdays', title: 'Добавить дни рождения', position: 4, completed: true },
        ]},
        { id: 102, hub_id: 1, slug: 'rules', title: 'Правила семьи', icon: 'BookOpen', route: '/family-code', position: 2, progress: 80, completed_steps: 4, total_steps: 5, steps: [
          { id: 1005, section_id: 102, slug: 'values', title: 'Семейные ценности', position: 1, completed: true },
          { id: 1006, section_id: 102, slug: 'traditions', title: 'Традиции семьи', position: 2, completed: true },
          { id: 1007, section_id: 102, slug: 'rules', title: 'Правила дома', position: 3, completed: true },
          { id: 1008, section_id: 102, slug: 'motto', title: 'Семейный девиз', position: 4, completed: true },
          { id: 1009, section_id: 102, slug: 'charter', title: 'Семейный устав', position: 5, completed: false },
        ]},
        { id: 103, hub_id: 1, slug: 'tree', title: 'Семейное дерево', icon: 'GitBranch', route: '/family-tree', position: 3, progress: 70, completed_steps: 7, total_steps: 10, steps: [
          { id: 1010, section_id: 103, slug: 'add_ancestors', title: 'Добавить предков', position: 1, completed: true },
          { id: 1011, section_id: 103, slug: 'photos_tree', title: 'Фото в дереве', position: 2, completed: true },
          { id: 1012, section_id: 103, slug: 'bio', title: 'Биографии', position: 3, completed: true },
          { id: 1013, section_id: 103, slug: 'connections', title: 'Связи между членами', position: 4, completed: true },
          { id: 1014, section_id: 103, slug: 'generations', title: '3+ поколения', position: 5, completed: true },
          { id: 1015, section_id: 103, slug: 'clan', title: 'Общий род', position: 6, completed: true },
          { id: 1016, section_id: 103, slug: 'stories', title: 'Истории рода', position: 7, completed: true },
          { id: 1017, section_id: 103, slug: 'docs', title: 'Документы рода', position: 8, completed: false },
          { id: 1018, section_id: 103, slug: 'map', title: 'География рода', position: 9, completed: false },
          { id: 1019, section_id: 103, slug: 'video', title: 'Видеоархив', position: 10, completed: false },
        ]},
        { id: 104, hub_id: 1, slug: 'album', title: 'Альбом поколений', icon: 'BookImage', route: '/memory', position: 4, progress: 60, completed_steps: 3, total_steps: 5, steps: [
          { id: 1020, section_id: 104, slug: 'first_album', title: 'Создать первый альбом', position: 1, completed: true },
          { id: 1021, section_id: 104, slug: 'upload_photos', title: 'Загрузить фотографии', position: 2, completed: true },
          { id: 1022, section_id: 104, slug: 'link_events', title: 'Привязать к событиям', position: 3, completed: true },
          { id: 1023, section_id: 104, slug: 'stories', title: 'Написать истории', position: 4, completed: false },
          { id: 1024, section_id: 104, slug: 'share', title: 'Поделиться с роднёй', position: 5, completed: false },
        ]},
      ],
    },
    {
      id: 2, slug: 'health', title: 'Здоровье', icon: 'HeartPulse', color: '#f97316',
      route: '/health', position: 2, scope: 'family',
      progress: 72, total_sections: 4, completed_sections: 2,
      sections: [
        { id: 201, hub_id: 2, slug: 'profiles_health', title: 'Профили здоровья', icon: 'User', route: '/health', position: 1, progress: 100, completed_steps: 5, total_steps: 5, steps: [
          { id: 2001, section_id: 201, slug: 'blood_type', title: 'Группа крови', position: 1, completed: true },
          { id: 2002, section_id: 201, slug: 'allergies', title: 'Аллергии', position: 2, completed: true },
          { id: 2003, section_id: 201, slug: 'chronic', title: 'Хронические заболевания', position: 3, completed: true },
          { id: 2004, section_id: 201, slug: 'vaccinations', title: 'Прививки', position: 4, completed: true },
          { id: 2005, section_id: 201, slug: 'insurance', title: 'Страховка', position: 5, completed: true },
        ]},
        { id: 202, hub_id: 2, slug: 'doctors', title: 'Врачи и записи', icon: 'Stethoscope', route: '/health', position: 2, progress: 80, completed_steps: 4, total_steps: 5, steps: [
          { id: 2006, section_id: 202, slug: 'add_doctors', title: 'Добавить врачей', position: 1, completed: true },
          { id: 2007, section_id: 202, slug: 'records', title: 'История обращений', position: 2, completed: true },
          { id: 2008, section_id: 202, slug: 'medications', title: 'Текущие препараты', position: 3, completed: true },
          { id: 2009, section_id: 202, slug: 'reminders', title: 'Напоминания о приёмах', position: 4, completed: true },
          { id: 2010, section_id: 202, slug: 'telemedicine', title: 'Телемедицина', position: 5, completed: false },
        ]},
        { id: 203, hub_id: 2, slug: 'diet', title: 'Питание', icon: 'Apple', route: '/nutrition', position: 3, progress: 60, completed_steps: 3, total_steps: 5, steps: [
          { id: 2011, section_id: 203, slug: 'preferences', title: 'Предпочтения в еде', position: 1, completed: true },
          { id: 2012, section_id: 203, slug: 'meal_plan', title: 'Меню на неделю', position: 2, completed: true },
          { id: 2013, section_id: 203, slug: 'recipes', title: '10+ рецептов', position: 3, completed: true },
          { id: 2014, section_id: 203, slug: 'diet_plan', title: 'Диет-план', position: 4, completed: false },
          { id: 2015, section_id: 203, slug: 'ai_menu', title: 'AI-меню от Домового', position: 5, completed: false },
        ]},
        { id: 204, hub_id: 2, slug: 'vitals', title: 'Показатели', icon: 'Activity', route: '/health', position: 4, progress: 50, completed_steps: 2, total_steps: 4, steps: [
          { id: 2016, section_id: 204, slug: 'weight', title: 'Отслеживать вес', position: 1, completed: true },
          { id: 2017, section_id: 204, slug: 'pressure', title: 'Давление', position: 2, completed: true },
          { id: 2018, section_id: 204, slug: 'sugar', title: 'Сахар крови', position: 3, completed: false },
          { id: 2019, section_id: 204, slug: 'sport', title: 'Активность и спорт', position: 4, completed: false },
        ]},
      ],
    },
    {
      id: 3, slug: 'finance', title: 'Финансы', icon: 'Wallet', color: '#22c55e',
      route: '/finance', position: 3, scope: 'family',
      progress: 78, total_sections: 4, completed_sections: 3,
      sections: [
        { id: 301, hub_id: 3, slug: 'budget', title: 'Бюджет семьи', icon: 'PieChart', route: '/finance', position: 1, progress: 100, completed_steps: 4, total_steps: 4, steps: [
          { id: 3001, section_id: 301, slug: 'income', title: 'Доходы семьи', position: 1, completed: true },
          { id: 3002, section_id: 301, slug: 'expenses', title: 'Категории расходов', position: 2, completed: true },
          { id: 3003, section_id: 301, slug: 'budget_limit', title: 'Лимиты по категориям', position: 3, completed: true },
          { id: 3004, section_id: 301, slug: 'savings', title: 'Цель накоплений', position: 4, completed: true },
        ]},
        { id: 302, hub_id: 3, slug: 'debts', title: 'Долги и кредиты', icon: 'CreditCard', route: '/finance', position: 2, progress: 75, completed_steps: 3, total_steps: 4, steps: [
          { id: 3005, section_id: 302, slug: 'mortgage', title: 'Ипотека', position: 1, completed: true },
          { id: 3006, section_id: 302, slug: 'credits', title: 'Кредиты', position: 2, completed: true },
          { id: 3007, section_id: 302, slug: 'debts_people', title: 'Долги между людьми', position: 3, completed: true },
          { id: 3008, section_id: 302, slug: 'schedule', title: 'График погашения', position: 4, completed: false },
        ]},
        { id: 303, hub_id: 3, slug: 'goals_fin', title: 'Финансовые цели', icon: 'Target', route: '/finance', position: 3, progress: 100, completed_steps: 3, total_steps: 3, steps: [
          { id: 3009, section_id: 303, slug: 'goal_vacation', title: 'Цель: отпуск', position: 1, completed: true },
          { id: 3010, section_id: 303, slug: 'goal_car', title: 'Цель: автомобиль', position: 2, completed: true },
          { id: 3011, section_id: 303, slug: 'goal_house', title: 'Цель: дом', position: 3, completed: true },
        ]},
        { id: 304, hub_id: 3, slug: 'wallet', title: 'Семейный кошелёк', icon: 'Banknote', route: '/finance', position: 4, progress: 40, completed_steps: 2, total_steps: 5, steps: [
          { id: 3012, section_id: 304, slug: 'accounts', title: 'Счета семьи', position: 1, completed: true },
          { id: 3013, section_id: 304, slug: 'cards', title: 'Карты и бонусы', position: 2, completed: true },
          { id: 3014, section_id: 304, slug: 'investments', title: 'Инвестиции', position: 3, completed: false },
          { id: 3015, section_id: 304, slug: 'insurance_fin', title: 'Страховки', position: 4, completed: false },
          { id: 3016, section_id: 304, slug: 'tax', title: 'Налоги и вычеты', position: 5, completed: false },
        ]},
      ],
    },
    {
      id: 4, slug: 'food', title: 'Питание', icon: 'Apple', color: '#ef4444',
      route: '/nutrition', position: 4, scope: 'family',
      progress: 65, total_sections: 3, completed_sections: 1,
      sections: [
        { id: 401, hub_id: 4, slug: 'recipes_hub', title: 'Рецепты', icon: 'ChefHat', route: '/recipes', position: 1, progress: 100, completed_steps: 3, total_steps: 3, steps: [
          { id: 4001, section_id: 401, slug: 'recipes_10', title: 'Добавить 10 рецептов', position: 1, completed: true },
          { id: 4002, section_id: 401, slug: 'categories', title: 'Категории', position: 2, completed: true },
          { id: 4003, section_id: 401, slug: 'favorites', title: 'Избранные рецепты', position: 3, completed: true },
        ]},
        { id: 402, hub_id: 4, slug: 'menu', title: 'Меню', icon: 'UtensilsCrossed', route: '/nutrition', position: 2, progress: 60, completed_steps: 3, total_steps: 5, steps: [
          { id: 4004, section_id: 402, slug: 'week_menu', title: 'Меню на неделю', position: 1, completed: true },
          { id: 4005, section_id: 402, slug: 'breakfast', title: 'Завтраки', position: 2, completed: true },
          { id: 4006, section_id: 402, slug: 'lunch', title: 'Обеды', position: 3, completed: true },
          { id: 4007, section_id: 402, slug: 'dinner', title: 'Ужины', position: 4, completed: false },
          { id: 4008, section_id: 402, slug: 'ai_suggestions', title: 'AI-предложения', position: 5, completed: false },
        ]},
        { id: 403, hub_id: 4, slug: 'shopping', title: 'Список покупок', icon: 'ShoppingCart', route: '/shopping', position: 3, progress: 40, completed_steps: 2, total_steps: 5, steps: [
          { id: 4009, section_id: 403, slug: 'list', title: 'Список покупок', position: 1, completed: true },
          { id: 4010, section_id: 403, slug: 'categories_shop', title: 'Категории', position: 2, completed: true },
          { id: 4011, section_id: 403, slug: 'assign', title: 'Распределить задания', position: 3, completed: false },
          { id: 4012, section_id: 403, slug: 'auto_list', title: 'Авто-список из меню', position: 4, completed: false },
          { id: 4013, section_id: 403, slug: 'stores', title: 'Магазины', position: 5, completed: false },
        ]},
      ],
    },
    {
      id: 5, slug: 'values', title: 'Ценности', icon: 'Heart', color: '#a855f7',
      route: '/family-code', position: 5, scope: 'family',
      progress: 55, total_sections: 3, completed_sections: 1,
      sections: [
        { id: 501, hub_id: 5, slug: 'values_list', title: 'Семейные ценности', icon: 'Sparkles', route: '/family-code', position: 1, progress: 100, completed_steps: 3, total_steps: 3, steps: [
          { id: 5001, section_id: 501, slug: 'define_values', title: 'Определить 5 ценностей', position: 1, completed: true },
          { id: 5002, section_id: 501, slug: 'describe', title: 'Описать каждую', position: 2, completed: true },
          { id: 5003, section_id: 501, slug: 'agree', title: 'Все согласились', position: 3, completed: true },
        ]},
        { id: 502, hub_id: 5, slug: 'traditions', title: 'Традиции', icon: 'Star', route: '/family-code', position: 2, progress: 67, completed_steps: 2, total_steps: 3, steps: [
          { id: 5004, section_id: 502, slug: 'trad_1', title: 'Воскресный завтрак', position: 1, completed: true },
          { id: 5005, section_id: 502, slug: 'trad_2', title: 'Летний лагерь', position: 2, completed: true },
          { id: 5006, section_id: 502, slug: 'trad_3', title: 'Семейная игровая ночь', position: 3, completed: false },
        ]},
        { id: 503, hub_id: 5, slug: 'code', title: 'Семейный код', icon: 'Shield', route: '/family-code', position: 3, progress: 0, completed_steps: 0, total_steps: 3, steps: [
          { id: 5007, section_id: 503, slug: 'mission', title: 'Миссия семьи', position: 1, completed: false },
          { id: 5008, section_id: 503, slug: 'vision', title: 'Видение на 10 лет', position: 2, completed: false },
          { id: 5009, section_id: 503, slug: 'manifesto', title: 'Манифест семьи', position: 3, completed: false },
        ]},
      ],
    },
    {
      id: 6, slug: 'planning', title: 'Планирование', icon: 'Target', color: '#06b6d4',
      route: '/calendar', position: 6, scope: 'family',
      progress: 80, total_sections: 4, completed_sections: 3,
      sections: [
        { id: 601, hub_id: 6, slug: 'calendar', title: 'Календарь', icon: 'Calendar', route: '/calendar', position: 1, progress: 100, completed_steps: 3, total_steps: 3, steps: [
          { id: 6001, section_id: 601, slug: 'events', title: 'Добавить события', position: 1, completed: true },
          { id: 6002, section_id: 601, slug: 'reminders', title: 'Настроить напоминания', position: 2, completed: true },
          { id: 6003, section_id: 601, slug: 'shared', title: 'Общий календарь', position: 3, completed: true },
        ]},
        { id: 602, hub_id: 6, slug: 'tasks_hub', title: 'Задачи', icon: 'CheckSquare', route: '/', position: 2, progress: 100, completed_steps: 3, total_steps: 3, steps: [
          { id: 6004, section_id: 602, slug: 'tasks_10', title: '10+ задач в работе', position: 1, completed: true },
          { id: 6005, section_id: 602, slug: 'assign_tasks', title: 'Назначить ответственных', position: 2, completed: true },
          { id: 6006, section_id: 602, slug: 'priorities', title: 'Установить приоритеты', position: 3, completed: true },
        ]},
        { id: 603, hub_id: 6, slug: 'goals_hub', title: 'Цели семьи', icon: 'Trophy', route: '/', position: 3, progress: 100, completed_steps: 4, total_steps: 4, steps: [
          { id: 6007, section_id: 603, slug: 'goals_3', title: 'Добавить 3+ цели', position: 1, completed: true },
          { id: 6008, section_id: 603, slug: 'deadlines', title: 'Установить сроки', position: 2, completed: true },
          { id: 6009, section_id: 603, slug: 'progress_goals', title: 'Отслеживать прогресс', position: 3, completed: true },
          { id: 6010, section_id: 603, slug: 'celebrate', title: 'Отпраздновать успех', position: 4, completed: true },
        ]},
        { id: 604, hub_id: 6, slug: 'votings', title: 'Голосования', icon: 'Vote', route: '/voting', position: 4, progress: 33, completed_steps: 1, total_steps: 3, steps: [
          { id: 6011, section_id: 604, slug: 'first_vote', title: 'Первое голосование', position: 1, completed: true },
          { id: 6012, section_id: 604, slug: 'rules_vote', title: 'Правила голосований', position: 2, completed: false },
          { id: 6013, section_id: 604, slug: 'regular', title: 'Регулярные опросы', position: 3, completed: false },
        ]},
      ],
    },
    {
      id: 7, slug: 'home', title: 'Быт', icon: 'Home', color: '#84cc16',
      route: '/home-module', position: 7, scope: 'family',
      progress: 58, total_sections: 3, completed_sections: 1,
      sections: [
        { id: 701, hub_id: 7, slug: 'responsibilities', title: 'Обязанности', icon: 'ClipboardList', route: '/', position: 1, progress: 100, completed_steps: 4, total_steps: 4, steps: [
          { id: 7001, section_id: 701, slug: 'list_resp', title: 'Список обязанностей', position: 1, completed: true },
          { id: 7002, section_id: 701, slug: 'assign_resp', title: 'Распределить', position: 2, completed: true },
          { id: 7003, section_id: 701, slug: 'schedule_resp', title: 'Расписание', position: 3, completed: true },
          { id: 7004, section_id: 701, slug: 'check_resp', title: 'Контроль выполнения', position: 4, completed: true },
        ]},
        { id: 702, hub_id: 7, slug: 'domovoy', title: 'Домовой', icon: 'Bot', route: '/domovoy', position: 2, progress: 50, completed_steps: 2, total_steps: 4, steps: [
          { id: 7005, section_id: 702, slug: 'first_ask', title: 'Первый вопрос', position: 1, completed: true },
          { id: 7006, section_id: 702, slug: 'customize', title: 'Настроить персонажа', position: 2, completed: true },
          { id: 7007, section_id: 702, slug: 'daily_tips', title: 'Ежедневные советы', position: 3, completed: false },
          { id: 7008, section_id: 702, slug: 'voice', title: 'Голосовое управление', position: 4, completed: false },
        ]},
        { id: 703, hub_id: 7, slug: 'garage', title: 'Гараж', icon: 'Car', route: '/garage', position: 3, progress: 25, completed_steps: 1, total_steps: 4, steps: [
          { id: 7009, section_id: 703, slug: 'add_car', title: 'Добавить автомобиль', position: 1, completed: true },
          { id: 7010, section_id: 703, slug: 'docs_car', title: 'Документы', position: 2, completed: false },
          { id: 7011, section_id: 703, slug: 'maintenance', title: 'ТО и ремонты', position: 3, completed: false },
          { id: 7012, section_id: 703, slug: 'insurance_car', title: 'Страховка', position: 4, completed: false },
        ]},
      ],
    },
    {
      id: 8, slug: 'travel', title: 'Путешествия', icon: 'Plane', color: '#0ea5e9',
      route: '/trips', position: 8, scope: 'family',
      progress: 83, total_sections: 3, completed_sections: 2,
      sections: [
        { id: 801, hub_id: 8, slug: 'trips_history', title: 'История поездок', icon: 'MapPin', route: '/trips', position: 1, progress: 100, completed_steps: 3, total_steps: 3, steps: [
          { id: 8001, section_id: 801, slug: 'add_trips', title: 'Добавить 3+ поездки', position: 1, completed: true },
          { id: 8002, section_id: 801, slug: 'photos_trips', title: 'Фото поездок', position: 2, completed: true },
          { id: 8003, section_id: 801, slug: 'budget_trips', title: 'Бюджет поездок', position: 3, completed: true },
        ]},
        { id: 802, hub_id: 8, slug: 'wishlist', title: 'Куда хотим', icon: 'Heart', route: '/trips', position: 2, progress: 100, completed_steps: 3, total_steps: 3, steps: [
          { id: 8004, section_id: 802, slug: 'bucket_list', title: 'Список мест-мечт', position: 1, completed: true },
          { id: 8005, section_id: 802, slug: 'vote_destination', title: 'Проголосовать куда', position: 2, completed: true },
          { id: 8006, section_id: 802, slug: 'plan_next', title: 'Запланировать следующую', position: 3, completed: true },
        ]},
        { id: 803, hub_id: 8, slug: 'planning_trip', title: 'Планирование', icon: 'Map', route: '/trips', position: 3, progress: 50, completed_steps: 2, total_steps: 4, steps: [
          { id: 8007, section_id: 803, slug: 'route', title: 'Маршрут', position: 1, completed: true },
          { id: 8008, section_id: 803, slug: 'hotel', title: 'Отели', position: 2, completed: true },
          { id: 8009, section_id: 803, slug: 'activities', title: 'Активности', position: 3, completed: false },
          { id: 8010, section_id: 803, slug: 'packing', title: 'Чемодан', position: 4, completed: false },
        ]},
      ],
    },
    {
      id: 9, slug: 'development', title: 'Развитие', icon: 'Sparkles', color: '#8b5cf6',
      route: '/life-road', position: 9, scope: 'family',
      progress: 60, total_sections: 4, completed_sections: 2,
      sections: [
        { id: 901, hub_id: 9, slug: 'life_road', title: 'Дорога жизни', icon: 'Route', route: '/life-road', position: 1, progress: 100, completed_steps: 4, total_steps: 4, steps: [
          { id: 9001, section_id: 901, slug: 'birth_event', title: 'Добавить рождение', position: 1, completed: true },
          { id: 9002, section_id: 901, slug: 'key_events', title: '5+ ключевых событий', position: 2, completed: true },
          { id: 9003, section_id: 901, slug: 'photos_events', title: 'Фото к событиям', position: 3, completed: true },
          { id: 9004, section_id: 901, slug: 'future_events', title: 'Цели на будущее', position: 4, completed: true },
        ]},
        { id: 902, hub_id: 9, slug: 'goals_dev', title: 'Цели и мастерская', icon: 'Target', route: '/life-road', position: 2, progress: 75, completed_steps: 3, total_steps: 4, steps: [
          { id: 9005, section_id: 902, slug: 'personal_goal', title: 'Личная цель', position: 1, completed: true },
          { id: 9006, section_id: 902, slug: 'family_goal', title: 'Семейная цель', position: 2, completed: true },
          { id: 9007, section_id: 902, slug: 'framework', title: 'Выбрать методику', position: 3, completed: true },
          { id: 9008, section_id: 902, slug: 'checkins', title: 'Еженедельные чекины', position: 4, completed: false },
        ]},
        { id: 903, hub_id: 9, slug: 'children_dev', title: 'Развитие детей', icon: 'GraduationCap', route: '/children', position: 3, progress: 50, completed_steps: 2, total_steps: 4, steps: [
          { id: 9009, section_id: 903, slug: 'child_profile', title: 'Профили детей', position: 1, completed: true },
          { id: 9010, section_id: 903, slug: 'dev_plan', title: 'Планы развития', position: 2, completed: true },
          { id: 9011, section_id: 903, slug: 'activities_kids', title: 'Кружки и секции', position: 3, completed: false },
          { id: 9012, section_id: 903, slug: 'assessments', title: 'Оценка прогресса', position: 4, completed: false },
        ]},
        { id: 904, hub_id: 9, slug: 'portfolio', title: 'Портфолио', icon: 'Award', route: '/portfolio', position: 4, progress: 25, completed_steps: 1, total_steps: 4, steps: [
          { id: 9013, section_id: 904, slug: 'achievements', title: 'Первое достижение', position: 1, completed: true },
          { id: 9014, section_id: 904, slug: 'skills', title: 'Навыки', position: 2, completed: false },
          { id: 9015, section_id: 904, slug: 'projects', title: 'Проекты', position: 3, completed: false },
          { id: 9016, section_id: 904, slug: 'share_portfolio', title: 'Поделиться', position: 4, completed: false },
        ]},
      ],
    },
    {
      id: 10, slug: 'pets', title: 'Питомцы', icon: 'PawPrint', color: '#f59e0b',
      route: '/pets', position: 10, scope: 'family',
      progress: 70, total_sections: 3, completed_sections: 2,
      sections: [
        { id: 1001, hub_id: 10, slug: 'pets_profiles', title: 'Профили питомцев', icon: 'PawPrint', route: '/pets', position: 1, progress: 100, completed_steps: 4, total_steps: 4, steps: [
          { id: 10001, section_id: 1001, slug: 'add_pet', title: 'Добавить питомца', position: 1, completed: true },
          { id: 10002, section_id: 1001, slug: 'pet_photo', title: 'Фото питомца', position: 2, completed: true },
          { id: 10003, section_id: 1001, slug: 'vet', title: 'Ветеринар', position: 3, completed: true },
          { id: 10004, section_id: 1001, slug: 'vaccinations_pet', title: 'Прививки', position: 4, completed: true },
        ]},
        { id: 1002, hub_id: 10, slug: 'pet_care', title: 'Уход', icon: 'Heart', route: '/pets', position: 2, progress: 100, completed_steps: 3, total_steps: 3, steps: [
          { id: 10005, section_id: 1002, slug: 'feeding', title: 'Питание', position: 1, completed: true },
          { id: 10006, section_id: 1002, slug: 'walks', title: 'Прогулки', position: 2, completed: true },
          { id: 10007, section_id: 1002, slug: 'grooming', title: 'Грумминг', position: 3, completed: true },
        ]},
        { id: 1003, hub_id: 10, slug: 'pet_docs', title: 'Документы', icon: 'FileText', route: '/pets', position: 3, progress: 33, completed_steps: 1, total_steps: 3, steps: [
          { id: 10008, section_id: 1003, slug: 'passport', title: 'Паспорт питомца', position: 1, completed: true },
          { id: 10009, section_id: 1003, slug: 'insurance_pet', title: 'Страховка', position: 2, completed: false },
          { id: 10010, section_id: 1003, slug: 'chip', title: 'Чипирование', position: 3, completed: false },
        ]},
      ],
    },
    {
      id: 11, slug: 'family_code', title: 'Семейный код', icon: 'Shield', color: '#ec4899',
      route: '/family-code', position: 11, scope: 'family',
      progress: 45, total_sections: 3, completed_sections: 1,
      sections: [
        { id: 1101, hub_id: 11, slug: 'rules_code', title: 'Правила', icon: 'BookOpen', route: '/family-code', position: 1, progress: 100, completed_steps: 3, total_steps: 3, steps: [
          { id: 11001, section_id: 1101, slug: 'house_rules', title: 'Правила дома', position: 1, completed: true },
          { id: 11002, section_id: 1101, slug: 'screen_rules', title: 'Правила экранов', position: 2, completed: true },
          { id: 11003, section_id: 1101, slug: 'money_rules', title: 'Правила денег', position: 3, completed: true },
        ]},
        { id: 1102, hub_id: 11, slug: 'agreements', title: 'Договорённости', icon: 'Handshake', route: '/family-code', position: 2, progress: 33, completed_steps: 1, total_steps: 3, steps: [
          { id: 11004, section_id: 1102, slug: 'agree_1', title: 'Уборка по расписанию', position: 1, completed: true },
          { id: 11005, section_id: 1102, slug: 'agree_2', title: 'Деньги на карманные', position: 2, completed: false },
          { id: 11006, section_id: 1102, slug: 'agree_3', title: 'Время на телефоне', position: 3, completed: false },
        ]},
        { id: 1103, hub_id: 11, slug: 'rituals', title: 'Ритуалы', icon: 'Sun', route: '/family-code', position: 3, progress: 0, completed_steps: 0, total_steps: 3, steps: [
          { id: 11007, section_id: 1103, slug: 'morning', title: 'Утренний ритуал', position: 1, completed: false },
          { id: 11008, section_id: 1103, slug: 'evening', title: 'Вечерний ритуал', position: 2, completed: false },
          { id: 11009, section_id: 1103, slug: 'weekend', title: 'Выходные', position: 3, completed: false },
        ]},
      ],
    },
  ],
};
