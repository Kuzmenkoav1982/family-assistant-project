// Демо-данные для детского раздела (Матвей ID:3, Даша ID:4, Илья ID:5)

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const subDays = (d: Date, n: number) => addDays(d, -n);

// ─── МАТВЕЙ (ID: '3'), 11 лет ────────────────────────────────────────────────
const matveyData = {
  health: {
    vaccinations: [
      { id: 'v1', date: fmt(subDays(today, 180)), vaccine: 'Грипп 2025', notes: 'Переносит хорошо, без температуры' },
      { id: 'v2', date: fmt(subDays(today, 400)), vaccine: 'АКДС (ревакцинация)', notes: '' },
      { id: 'v3', date: fmt(subDays(today, 700)), vaccine: 'Корь, краснуха, паротит', notes: 'Плановая прививка' },
    ],
    prescriptions: [],
    analyses: [],
    doctorVisits: [
      {
        id: 'dv1',
        date: fmt(addDays(today, 14)),
        doctor: 'Педиатр Смирнова Е.В.',
        specialty: 'Педиатр',
        status: 'planned' as const,
        notes: 'Плановый осмотр перед летним лагерем',
      },
      {
        id: 'dv2',
        date: fmt(subDays(today, 30)),
        doctor: 'Хирург Петров А.С.',
        specialty: 'Хирург',
        status: 'completed' as const,
        notes: 'Справка для секции футбола — здоров',
      },
    ],
    medications: [],
  },
  purchases: [
    {
      id: 'p1',
      season: 'spring' as const,
      category: 'Одежда',
      items: [
        { id: 'pi1', name: 'Кроссовки для футбола', priority: 'high' as const, estimated_cost: 4500, purchased: false },
        { id: 'pi2', name: 'Спортивные шорты (3 шт)', priority: 'medium' as const, estimated_cost: 1800, purchased: true },
      ],
    },
    {
      id: 'p2',
      season: 'autumn' as const,
      category: 'Школа',
      items: [
        { id: 'pi3', name: 'Ранец Nike', priority: 'high' as const, estimated_cost: 5500, purchased: false },
        { id: 'pi4', name: 'Канцелярия на год', priority: 'high' as const, estimated_cost: 2500, purchased: true },
        { id: 'pi5', name: 'Школьная форма', priority: 'medium' as const, estimated_cost: 6000, purchased: false },
      ],
    },
  ],
  gifts: [
    { id: 'g1', event: 'День рождения (14 мая)', date: fmt(addDays(today, 55)), gift: 'Велосипед BMX', given: false, notes: 'Хочет чёрный или синий, размер колёс 24"' },
    { id: 'g2', event: 'Новый год', date: '2025-01-01', gift: 'Конструктор LEGO Technic', given: true, notes: '' },
    { id: 'g3', event: 'Окончание четверти', date: fmt(addDays(today, 30)), gift: 'Игра для PlayStation', given: false, notes: 'FIFA 25 или EA Sports' },
  ],
  development: [
    {
      id: 'dev1',
      area: 'sport' as const,
      current_level: 72,
      target_level: 90,
      activities: [
        { id: 'act1', type: 'Секция', name: 'Футбол (ДЮСШ)', schedule: 'Вт, Чт, Сб 17:00–19:00', cost: 3000, status: 'active' as const },
        { id: 'act2', type: 'Занятие', name: 'Плавание', schedule: 'Пн 09:00', cost: 1500, status: 'planned' as const },
      ],
      tests: [
        { id: 'tst1', name: 'Бег 1000м', status: 'completed' as const, score: 85, reward_points: 50 },
      ],
    },
    {
      id: 'dev2',
      area: 'education' as const,
      current_level: 80,
      target_level: 95,
      activities: [
        { id: 'act3', type: 'Репетитор', name: 'Математика (Олимпиадный уровень)', schedule: 'Ср 16:00', cost: 2500, status: 'active' as const },
      ],
      tests: [
        { id: 'tst2', name: 'Школьная олимпиада по математике', status: 'completed' as const, score: 92, reward_points: 100 },
      ],
    },
    {
      id: 'dev3',
      area: 'hobby' as const,
      current_level: 55,
      target_level: 75,
      activities: [
        { id: 'act4', type: 'Кружок', name: 'Программирование (Scratch/Python)', schedule: 'Пт 15:00', cost: 2000, status: 'active' as const },
      ],
      tests: [],
    },
  ],
  school: {
    id: 's1',
    mesh_integration: false,
    current_grade: '5 класс',
    grades: [
      { subject: 'Математика', grade: 5, date: fmt(subDays(today, 5)) },
      { subject: 'Русский язык', grade: 4, date: fmt(subDays(today, 6)) },
      { subject: 'Английский язык', grade: 5, date: fmt(subDays(today, 7)) },
      { subject: 'Литература', grade: 5, date: fmt(subDays(today, 8)) },
      { subject: 'История', grade: 4, date: fmt(subDays(today, 9)) },
      { subject: 'Физкультура', grade: 5, date: fmt(subDays(today, 10)) },
      { subject: 'Информатика', grade: 5, date: fmt(subDays(today, 11)) },
    ],
  },
  dreams: [
    { id: 'dr1', title: 'Стать профессиональным футболистом', description: 'Хочу играть в Premier League', created_date: fmt(subDays(today, 90)), achieved: false },
    { id: 'dr2', title: 'Поехать на Чемпионат мира', description: 'Посмотреть вживую финал', created_date: fmt(subDays(today, 60)), achieved: false },
    { id: 'dr3', title: 'Создать свою игру', description: 'Написать игру на Python', created_date: fmt(subDays(today, 30)), achieved: false },
  ],
  diary: [],
  piggyBank: {
    balance: 2350,
    transactions: [
      { id: 'tr1', date: fmt(subDays(today, 3)), amount: 500, type: 'income', description: 'За отличные оценки в четверти' },
      { id: 'tr2', date: fmt(subDays(today, 7)), amount: 200, type: 'income', description: 'За уборку гаража с папой' },
      { id: 'tr3', date: fmt(subDays(today, 10)), amount: -150, type: 'expense', description: 'Купил наклейки для скейтборда' },
      { id: 'tr4', date: fmt(subDays(today, 15)), amount: 1000, type: 'income', description: 'День рождения — подарок от бабушки' },
      { id: 'tr5', date: fmt(subDays(today, 20)), amount: -200, type: 'expense', description: 'Кино с другом' },
    ],
  },
};

// ─── ДАША (ID: '4'), 8 лет ──────────────────────────────────────────────────
const dashaData = {
  health: {
    vaccinations: [
      { id: 'v1', date: fmt(subDays(today, 90)), vaccine: 'Грипп 2025', notes: 'Лёгкая реакция, температура 37.2' },
      { id: 'v2', date: fmt(subDays(today, 500)), vaccine: 'Ветряная оспа', notes: 'Плановая прививка' },
    ],
    prescriptions: [],
    analyses: [],
    doctorVisits: [
      {
        id: 'dv1',
        date: fmt(addDays(today, 7)),
        doctor: 'Стоматолог Козлова М.А.',
        specialty: 'Стоматолог',
        status: 'planned' as const,
        notes: 'Плановая чистка и осмотр',
      },
      {
        id: 'dv2',
        date: fmt(subDays(today, 45)),
        doctor: 'Офтальмолог Новиков С.П.',
        specialty: 'Офтальмолог',
        status: 'completed' as const,
        notes: 'Зрение в норме, -0.25 на левый глаз',
      },
    ],
    medications: [],
  },
  purchases: [
    {
      id: 'p1',
      season: 'spring' as const,
      category: 'Одежда',
      items: [
        { id: 'pi1', name: 'Летние платья (2 шт)', priority: 'medium' as const, estimated_cost: 3000, purchased: true },
        { id: 'pi2', name: 'Сандалии', priority: 'high' as const, estimated_cost: 2000, purchased: false },
        { id: 'pi3', name: 'Джинсы', priority: 'medium' as const, estimated_cost: 2500, purchased: false },
      ],
    },
    {
      id: 'p2',
      season: 'autumn' as const,
      category: 'Творчество',
      items: [
        { id: 'pi4', name: 'Краски акварельные профессиональные', priority: 'high' as const, estimated_cost: 1800, purchased: false },
        { id: 'pi5', name: 'Мольберт детский', priority: 'medium' as const, estimated_cost: 3500, purchased: false },
      ],
    },
  ],
  gifts: [
    { id: 'g1', event: 'День рождения (11 марта)', date: fmt(addDays(today, 3)), gift: 'Набор для рисования и акварели', given: false, notes: 'Профессиональные краски, бумага А3' },
    { id: 'g2', event: 'Новый год', date: '2025-01-01', gift: 'Кукла LOL Surprise + домик', given: true, notes: '' },
    { id: 'g3', event: 'Конец учебного года', date: fmt(addDays(today, 80)), gift: 'Поездка в Москву в музей', given: false, notes: 'Музей изобразительных искусств' },
  ],
  development: [
    {
      id: 'dev1',
      area: 'creative' as const,
      current_level: 78,
      target_level: 92,
      activities: [
        { id: 'act1', type: 'Студия', name: 'Рисование и живопись', schedule: 'Пн, Ср 15:30–17:00', cost: 3500, status: 'active' as const },
        { id: 'act2', type: 'Кружок', name: 'Лепка из глины', schedule: 'Пт 15:00', cost: 1500, status: 'active' as const },
      ],
      tests: [
        { id: 'tst1', name: 'Конкурс рисунков «Моя семья»', status: 'completed' as const, score: 95, reward_points: 80 },
      ],
    },
    {
      id: 'dev2',
      area: 'education' as const,
      current_level: 85,
      target_level: 90,
      activities: [
        { id: 'act3', type: 'Занятие', name: 'Чтение (30 минут в день)', schedule: 'Ежедневно', cost: 0, status: 'active' as const },
      ],
      tests: [],
    },
    {
      id: 'dev3',
      area: 'social' as const,
      current_level: 90,
      target_level: 95,
      activities: [
        { id: 'act4', type: 'Студия', name: 'Театральный кружок', schedule: 'Вт, Чт 16:00', cost: 2000, status: 'active' as const },
      ],
      tests: [],
    },
  ],
  school: {
    id: 's1',
    mesh_integration: false,
    current_grade: '2 класс',
    grades: [
      { subject: 'Математика', grade: 5, date: fmt(subDays(today, 4)) },
      { subject: 'Русский язык', grade: 5, date: fmt(subDays(today, 5)) },
      { subject: 'Чтение', grade: 5, date: fmt(subDays(today, 6)) },
      { subject: 'Окружающий мир', grade: 5, date: fmt(subDays(today, 7)) },
      { subject: 'Рисование', grade: 5, date: fmt(subDays(today, 8)) },
      { subject: 'Физкультура', grade: 5, date: fmt(subDays(today, 9)) },
    ],
  },
  dreams: [
    { id: 'dr1', title: 'Стать известным художником', description: 'Хочу чтобы мои картины висели в музее', created_date: fmt(subDays(today, 120)), achieved: false },
    { id: 'dr2', title: 'Завести кошку', description: 'Рыжую кошку по имени Апельсинка', created_date: fmt(subDays(today, 45)), achieved: false },
    { id: 'dr3', title: 'Поехать в Диснейленд', description: 'Хочу увидеть принцесс вживую!', created_date: fmt(subDays(today, 20)), achieved: false },
  ],
  diary: [],
  piggyBank: {
    balance: 850,
    transactions: [
      { id: 'tr1', date: fmt(subDays(today, 2)), amount: 200, type: 'income', description: 'За помощь маме' },
      { id: 'tr2', date: fmt(subDays(today, 8)), amount: 300, type: 'income', description: 'Убрала свою комнату без напоминаний' },
      { id: 'tr3', date: fmt(subDays(today, 12)), amount: -100, type: 'expense', description: 'Купила альбом для рисования' },
      { id: 'tr4', date: fmt(subDays(today, 20)), amount: 500, type: 'income', description: 'Подарок от дедушки' },
      { id: 'tr5', date: fmt(subDays(today, 25)), amount: -50, type: 'expense', description: 'Карандаши цветные' },
    ],
  },
};

// ─── ИЛЬЯ (ID: '5'), 5 лет ───────────────────────────────────────────────────
const ilyaData = {
  health: {
    vaccinations: [
      { id: 'v1', date: fmt(subDays(today, 60)), vaccine: 'Грипп 2025', notes: 'Без реакций' },
      { id: 'v2', date: fmt(subDays(today, 180)), vaccine: 'Полиомиелит', notes: 'Плановая' },
      { id: 'v3', date: fmt(subDays(today, 365)), vaccine: 'АКДС', notes: 'Плановая ревакцинация' },
    ],
    prescriptions: [],
    analyses: [],
    doctorVisits: [
      {
        id: 'dv1',
        date: fmt(addDays(today, 21)),
        doctor: 'Невролог Ларина О.Б.',
        specialty: 'Невролог',
        status: 'planned' as const,
        notes: 'Плановый осмотр перед поступлением в школу',
      },
      {
        id: 'dv2',
        date: fmt(subDays(today, 14)),
        doctor: 'Педиатр Смирнова Е.В.',
        specialty: 'Педиатр',
        status: 'completed' as const,
        notes: 'Здоров, вес и рост в норме',
      },
    ],
    medications: [
      {
        id: 'med1',
        name: 'Витамин D3',
        start_date: fmt(subDays(today, 30)),
        end_date: fmt(addDays(today, 60)),
        frequency: 'daily',
        dosage: '1 капля',
        schedule: [{ time_of_day: 'morning' }],
        intakes: [],
      },
    ],
  },
  purchases: [
    {
      id: 'p1',
      season: 'spring' as const,
      category: 'Одежда',
      items: [
        { id: 'pi1', name: 'Резиновые сапоги', priority: 'high' as const, estimated_cost: 1500, purchased: true },
        { id: 'pi2', name: 'Ветровка', priority: 'high' as const, estimated_cost: 2500, purchased: false },
      ],
    },
    {
      id: 'p2',
      season: 'autumn' as const,
      category: 'Подготовка к школе',
      items: [
        { id: 'pi3', name: 'Буквари и прописи', priority: 'high' as const, estimated_cost: 800, purchased: false },
        { id: 'pi4', name: 'Школьный рюкзак (лёгкий)', priority: 'high' as const, estimated_cost: 3000, purchased: false },
        { id: 'pi5', name: 'Пластилин и краски', priority: 'medium' as const, estimated_cost: 600, purchased: true },
      ],
    },
  ],
  gifts: [
    { id: 'g1', event: 'День рождения (3 ноября)', date: fmt(addDays(today, 228)), gift: 'Набор Lego Duplo "Зоопарк"', given: false, notes: 'Обожает животных' },
    { id: 'g2', event: 'Новый год', date: '2025-01-01', gift: 'Самокат трёхколёсный', given: true, notes: '' },
    { id: 'g3', event: 'Окончание садика', date: fmt(addDays(today, 90)), gift: 'Велосипед с дополнительными колёсами', given: false, notes: 'Хочет как у Матвея' },
  ],
  development: [
    {
      id: 'dev1',
      area: 'social' as const,
      current_level: 70,
      target_level: 85,
      activities: [
        { id: 'act1', type: 'Детский сад', name: 'Старшая группа д/с №14', schedule: 'Пн–Пт 08:00–18:00', cost: 0, status: 'active' as const },
      ],
      tests: [],
    },
    {
      id: 'dev2',
      area: 'creative' as const,
      current_level: 60,
      target_level: 80,
      activities: [
        { id: 'act2', type: 'Кружок', name: 'Рисование в детском саду', schedule: 'Вт, Пт', cost: 0, status: 'active' as const },
        { id: 'act3', type: 'Занятие', name: 'Лепка из пластилина', schedule: 'Ежедневно дома', cost: 0, status: 'active' as const },
      ],
      tests: [],
    },
    {
      id: 'dev3',
      area: 'education' as const,
      current_level: 50,
      target_level: 75,
      activities: [
        { id: 'act4', type: 'Занятие', name: 'Подготовка к школе (буквы, цифры)', schedule: 'Ежедневно 20 мин', cost: 0, status: 'active' as const },
      ],
      tests: [
        { id: 'tst1', name: 'Знает буквы алфавита', status: 'completed' as const, score: 80, reward_points: 30 },
        { id: 'tst2', name: 'Считает до 20', status: 'completed' as const, score: 90, reward_points: 30 },
      ],
    },
  ],
  school: undefined,
  dreams: [
    { id: 'dr1', title: 'Стать пожарным', description: 'Хочу спасать людей и кошек', created_date: fmt(subDays(today, 30)), achieved: false },
    { id: 'dr2', title: 'Иметь собаку', description: 'Большую и пушистую', created_date: fmt(subDays(today, 14)), achieved: false },
  ],
  diary: [],
  piggyBank: {
    balance: 350,
    transactions: [
      { id: 'tr1', date: fmt(subDays(today, 5)), amount: 100, type: 'income', description: 'Убрал игрушки сам' },
      { id: 'tr2', date: fmt(subDays(today, 10)), amount: 200, type: 'income', description: 'Подарок от тёти' },
      { id: 'tr3', date: fmt(subDays(today, 15)), amount: -50, type: 'expense', description: 'Наклейки с динозаврами' },
    ],
  },
};

// ─── Карта данных по ID ───────────────────────────────────────────────────────
export const DEMO_CHILDREN_DATA: Record<string, typeof matveyData> = {
  '3': matveyData,
  '4': dashaData as typeof matveyData,
  '5': ilyaData as typeof matveyData,
};

// Данные для ChildCalendar (localStorage)
export const DEMO_CALENDAR_EVENTS: Record<string, object[]> = {
  '3': [
    { id: 'ce1', title: 'Футбол — тренировка', description: 'ДЮСШ, зал №2', date: fmt(addDays(today, 1)), time: '17:00', category: 'sport', color: '#10b981', reminderEnabled: true },
    { id: 'ce2', title: 'Репетитор по математике', description: 'Онлайн, ссылка в WhatsApp', date: fmt(addDays(today, 3)), time: '16:00', category: 'school', color: '#8b5cf6', reminderEnabled: true },
    { id: 'ce3', title: 'Педиатр — плановый осмотр', description: 'Поликлиника №5, каб. 8', date: fmt(addDays(today, 14)), time: '10:30', category: 'health', color: '#ef4444', reminderEnabled: true },
    { id: 'ce4', title: 'Кружок программирования', description: 'Технопарк "Кванториум"', date: fmt(addDays(today, 5)), time: '15:00', category: 'hobby', color: '#f59e0b', reminderEnabled: false },
    { id: 'ce5', title: 'Футбол — тренировка', description: 'ДЮСШ, поле', date: fmt(addDays(today, 6)), time: '17:00', category: 'sport', color: '#10b981', reminderEnabled: false },
    { id: 'ce6', title: 'Футбол — тренировка', description: 'ДЮСШ, зал №2', date: fmt(addDays(today, 8)), time: '17:00', category: 'sport', color: '#10b981', reminderEnabled: false },
    { id: 'ce7', title: 'Школьная олимпиада по математике', description: 'Школа №12, актовый зал', date: fmt(addDays(today, 12)), time: '09:00', category: 'school', color: '#8b5cf6', reminderEnabled: true },
  ],
  '4': [
    { id: 'ce1', title: 'Рисование — студия', description: 'ДК "Прометей", 2 этаж', date: fmt(addDays(today, 1)), time: '15:30', category: 'hobby', color: '#f59e0b', reminderEnabled: true },
    { id: 'ce2', title: 'Театральный кружок', description: 'Школа №12, актовый зал', date: fmt(addDays(today, 2)), time: '16:00', category: 'hobby', color: '#f59e0b', reminderEnabled: true },
    { id: 'ce3', title: 'Стоматолог', description: 'Детская клиника, каб. 3', date: fmt(addDays(today, 7)), time: '11:00', category: 'health', color: '#ef4444', reminderEnabled: true },
    { id: 'ce4', title: 'День рождения Даши! 🎂', description: 'Празднуем дома, торт заказан', date: fmt(addDays(today, 3)), time: '12:00', category: 'other', color: '#3b82f6', reminderEnabled: true },
    { id: 'ce5', title: 'Рисование — студия', description: 'ДК "Прометей", 2 этаж', date: fmt(addDays(today, 4)), time: '15:30', category: 'hobby', color: '#f59e0b', reminderEnabled: false },
    { id: 'ce6', title: 'Конкурс рисунков в школе', description: 'Принести работу в пятницу', date: fmt(addDays(today, 10)), time: '09:00', category: 'school', color: '#8b5cf6', reminderEnabled: true },
  ],
  '5': [
    { id: 'ce1', title: 'Детский сад', description: 'Не забыть сменную обувь', date: fmt(addDays(today, 1)), time: '08:00', category: 'school', color: '#8b5cf6', reminderEnabled: false },
    { id: 'ce2', title: 'Невролог — плановый', description: 'Поликлиника №5', date: fmt(addDays(today, 21)), time: '10:00', category: 'health', color: '#ef4444', reminderEnabled: true },
    { id: 'ce3', title: 'Занятие с мамой — буквы', description: 'Прописи, стр. 12–14', date: fmt(addDays(today, 2)), time: '18:30', category: 'school', color: '#8b5cf6', reminderEnabled: false },
    { id: 'ce4', title: 'Утренник в детском саду 🎭', description: 'Костюм медведя готов', date: fmt(addDays(today, 15)), time: '10:00', category: 'other', color: '#3b82f6', reminderEnabled: true },
    { id: 'ce5', title: 'Прогулка в парке с папой', description: 'Кататься на самокате', date: fmt(addDays(today, 3)), time: '15:00', category: 'other', color: '#3b82f6', reminderEnabled: false },
  ],
};
