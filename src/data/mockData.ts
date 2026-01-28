import type {
  FamilyMember,
  Task,
  ChildProfile,
  DevelopmentPlan,
  ImportantDate,
  FamilyValue,
  BlogPost,
  Tradition,
  MealVoting,
  ChatMessage,
  FamilyAlbum,
  FamilyNeed,
  FamilyTreeMember,
  CalendarEvent,
  AIRecommendation,
  FamilyGoal,
} from '@/types/family.types';

export const initialFamilyMembers: FamilyMember[] = [
  { 
    id: '1', 
    name: 'Алексей', 
    role: 'Отец', 
    workload: 70, 
    avatar: 'https://cdn.poehali.dev/files/fb82400e-4e48-4d25-9de7-a9991f13aa29.png',
    photoUrl: 'https://cdn.poehali.dev/files/fb82400e-4e48-4d25-9de7-a9991f13aa29.png',
    age: 43,
    points: 580, 
    level: 6, 
    achievements: ['early_bird', 'helper', 'chef', 'organizer'],
    foodPreferences: {
      favorites: ['Стейк с картофелем', 'Плов', 'Борщ', 'Шашлык'],
      dislikes: ['Баклажаны', 'Оливки']
    },
    responsibilities: ['Покупки', 'Вынос мусора', 'Ремонт', 'Финансы']
  },
  { 
    id: '2', 
    name: 'Анастасия', 
    role: 'Мать', 
    workload: 85, 
    avatar: 'https://cdn.poehali.dev/files/3a7d0304-7fd5-4cd7-ac79-f4c235eb7484.png',
    photoUrl: 'https://cdn.poehali.dev/files/3a7d0304-7fd5-4cd7-ac79-f4c235eb7484.png',
    age: 38,
    points: 820, 
    level: 8, 
    achievements: ['organizer', 'champion', 'master_chef', 'wise'],
    foodPreferences: {
      favorites: ['Салаты', 'Рыба на пару', 'Овощи гриль', 'Смузи'],
      dislikes: ['Жирное мясо', 'Майонез']
    },
    responsibilities: ['Готовка', 'Стирка', 'Уборка', 'Дети']
  },
  { 
    id: '3', 
    name: 'Матвей', 
    role: 'Сын', 
    workload: 35, 
    avatar: 'https://cdn.poehali.dev/files/2c506753-6a4d-447e-a8b2-294bceb38a95.png',
    photoUrl: 'https://cdn.poehali.dev/files/2c506753-6a4d-447e-a8b2-294bceb38a95.png',
    age: 11,
    points: 340, 
    level: 4, 
    achievements: ['student', 'helper', 'gamer'],
    foodPreferences: {
      favorites: ['Пицца', 'Бургеры', 'Пельмени', 'Картофель фри'],
      dislikes: ['Брокколи', 'Рыба', 'Лук']
    },
    responsibilities: ['Уроки', 'Уборка комнаты', 'Выгул собаки']
  },
  { 
    id: '4', 
    name: 'Даша', 
    role: 'Дочь', 
    workload: 28, 
    avatar: 'https://cdn.poehali.dev/files/fcce342c-9b14-420d-b3eb-97084a3bbe08.png',
    photoUrl: 'https://cdn.poehali.dev/files/fcce342c-9b14-420d-b3eb-97084a3bbe08.png',
    age: 8,
    points: 210, 
    level: 3, 
    achievements: ['beginner', 'artist'],
    foodPreferences: {
      favorites: ['Макароны с сыром', 'Блинчики', 'Мороженое', 'Фрукты'],
      dislikes: ['Острое', 'Печень']
    },
    responsibilities: ['Убрать игрушки', 'Полить цветы', 'Помощь маме']
  },
  { 
    id: '5', 
    name: 'Илья', 
    role: 'Сын', 
    workload: 15, 
    avatar: 'https://cdn.poehali.dev/files/c58eac3b-e952-42aa-abe0-9b1141530809.png',
    photoUrl: 'https://cdn.poehali.dev/files/c58eac3b-e952-42aa-abe0-9b1141530809.png',
    age: 5,
    points: 85, 
    level: 1, 
    achievements: ['beginner'],
    foodPreferences: {
      favorites: ['Каша с мёдом', 'Котлеты', 'Йогурт', 'Печенье'],
      dislikes: ['Овощи', 'Суп']
    },
    responsibilities: ['Убрать игрушки', 'Помочь накрыть на стол']
  }
];

export const initialTasks: Task[] = [
  { id: '1', title: 'Приготовить ужин', assignee: 'Анастасия', completed: false, category: 'Кухня', points: 30, reminderTime: '18:00', isRecurring: true, recurringPattern: { frequency: 'daily', interval: 1 }, nextOccurrence: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
  { id: '2', title: 'Вынести мусор', assignee: 'Алексей', completed: true, category: 'Дом', points: 10, isRecurring: true, recurringPattern: { frequency: 'weekly', interval: 1, daysOfWeek: [1, 4] }, nextOccurrence: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] },
  { id: '3', title: 'Математика - упражнения 45-50', assignee: 'Матвей', completed: false, category: 'Учеба', points: 25, reminderTime: '16:00', isRecurring: true, recurringPattern: { frequency: 'daily', interval: 1, daysOfWeek: [1, 2, 3, 4, 5] }, nextOccurrence: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
  { id: '4', title: 'Убрать комнату', assignee: 'Даша', completed: false, category: 'Дом', points: 20, isRecurring: true, recurringPattern: { frequency: 'weekly', interval: 1, daysOfWeek: [6] }, nextOccurrence: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] },
  { id: '5', title: 'Выгулять собаку Рекса', assignee: 'Матвей', completed: false, category: 'Питомцы', points: 15, isRecurring: true, recurringPattern: { frequency: 'daily', interval: 1 }, nextOccurrence: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
  { id: '6', title: 'Купить продукты в Пятёрочке', assignee: 'Алексей', completed: false, category: 'Покупки', points: 20, reminderTime: '12:00', shoppingList: ['Молоко', 'Хлеб', 'Яйца', 'Овощи', 'Мясо'] },
  { id: '7', title: 'Отвезти Дашу на танцы', assignee: 'Анастасия', completed: true, category: 'Дети', points: 25, reminderTime: '16:30' },
  { id: '8', title: 'Постирать белье', assignee: 'Анастасия', completed: true, category: 'Дом', points: 20 },
  { id: '9', title: 'Помыть посуду после ужина', assignee: 'Матвей', completed: true, category: 'Кухня', points: 15 },
  { id: '10', title: 'Полить цветы на балконе', assignee: 'Даша', completed: false, category: 'Дом', points: 10 },
  { id: '11', title: 'Оплатить коммунальные услуги', assignee: 'Алексей', completed: false, category: 'Финансы', points: 25, reminderTime: '10:00' },
  { id: '12', title: 'Генеральная уборка квартиры', assignee: 'Анастасия', completed: false, category: 'Дом', points: 50, isRecurring: true, recurringPattern: { frequency: 'monthly', interval: 1 }, nextOccurrence: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] },
  { id: '13', title: 'Почитать с Ильёй сказку', assignee: 'Анастасия', completed: false, category: 'Дети', points: 20, reminderTime: '20:30' },
  { id: '14', title: 'Проверить уроки у Матвея', assignee: 'Алексей', completed: false, category: 'Учеба', points: 20 },
  { id: '15', title: 'Приготовить завтрак', assignee: 'Анастасия', completed: true, category: 'Кухня', points: 20, isRecurring: true, recurringPattern: { frequency: 'daily', interval: 1 }, nextOccurrence: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
  { id: '16', title: 'Футбольная тренировка Матвея', assignee: 'Алексей', completed: false, category: 'Дети', points: 15, reminderTime: '17:00' },
  { id: '17', title: 'Собрать портфель в детский сад', assignee: 'Анастасия', completed: false, category: 'Дети', points: 10, isRecurring: true, recurringPattern: { frequency: 'daily', interval: 1, daysOfWeek: [1, 2, 3, 4, 5] }, nextOccurrence: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
  { id: '18', title: 'Купить подарок на день рождения', assignee: 'Алексей', completed: false, category: 'Покупки', points: 30 },
  { id: '19', title: 'Записаться к стоматологу', assignee: 'Анастасия', completed: false, category: 'Здоровье', points: 15 },
  { id: '20', title: 'Помочь Илье собрать игрушки', assignee: 'Даша', completed: false, category: 'Дом', points: 10 }
];

export const initialChildrenProfiles: ChildProfile[] = [];

export const initialDevelopmentPlans: DevelopmentPlan[] = [];

export const initialImportantDates: ImportantDate[] = [
  { id: '1', title: 'День рождения Матвея', date: '2026-05-14', type: 'birthday', daysLeft: 105 },
  { id: '2', title: 'Годовщина свадьбы Алексея и Анастасии', date: '2026-08-22', type: 'anniversary', daysLeft: 205 },
  { id: '3', title: 'День рождения Даши', date: '2026-03-11', type: 'birthday', daysLeft: 41 },
  { id: '4', title: 'День рождения Ильи', date: '2026-11-03', type: 'birthday', daysLeft: 278 },
  { id: '5', title: 'Первое сентября - школа', date: '2026-09-01', type: 'milestone', daysLeft: 215 },
];

export const initialFamilyValues: FamilyValue[] = [
  {
    id: '1',
    title: 'Честность',
    description: 'В нашей семье мы всегда говорим правду и поддерживаем открытое общение',
    icon: '🤝',
    tradition: 'Семейный совет каждое воскресенье в 11:00'
  },
  {
    id: '2',
    title: 'Взаимопомощь',
    description: 'Мы помогаем друг другу и радуемся успехам вместе',
    icon: '❤️',
    tradition: 'День добрых дел каждую субботу'
  },
  {
    id: '3',
    title: 'Образование',
    description: 'Мы ценим знания и стремимся к развитию',
    icon: '📚',
    tradition: 'Семейное чтение перед сном'
  },
  {
    id: '4',
    title: 'Традиции',
    description: 'Мы чтим семейные традиции и создаем новые воспоминания',
    icon: '🎉',
    tradition: 'Воскресные семейные обеды у бабушки'
  }
];

export const initialBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Поездка на дачу всей семьёй',
    author: 'Алексей',
    date: '2026-01-20',
    category: 'Путешествия',
    excerpt: 'Провели выходные на даче. Дети помогали копать грядки, а вечером жарили шашлык!',
    likes: 15,
    comments: 7
  },
  {
    id: '2',
    title: 'Рецепт Анастасии: борщ как у мамы',
    author: 'Анастасия',
    date: '2026-01-15',
    category: 'Кулинария',
    excerpt: 'Делюсь семейным рецептом борща, который передается из поколения в поколение',
    likes: 28,
    comments: 12
  },
  {
    id: '3',
    title: 'Матвей выиграл футбольный турнир!',
    author: 'Анастасия',
    date: '2026-01-10',
    category: 'Достижения',
    excerpt: 'Матвей забил решающий гол и привел команду к победе! Гордимся нашим чемпионом!',
    likes: 22,
    comments: 9
  },
  {
    id: '4',
    title: 'Даша станцевала на школьном концерте',
    author: 'Анастасия',
    date: '2025-12-25',
    category: 'Творчество',
    excerpt: 'Наша маленькая балерина выступила на сцене. Было волнительно и прекрасно!',
    likes: 19,
    comments: 8
  }
];

export const initialTraditions: Tradition[] = [
  {
    id: '1',
    title: 'Воскресный семейный обед',
    description: 'Каждое воскресенье мы собираемся всей семьей за большим столом, готовим вместе и делимся новостями недели',
    frequency: 'Еженедельно',
    icon: '🍽️',
    participants: ['Алексей', 'Анастасия', 'Матвей', 'Даша', 'Илья']
  },
  {
    id: '2',
    title: 'Пятничный киновечер',
    description: 'Каждую пятницу вечером мы вместе смотрим семейный фильм с попкорном',
    frequency: 'Еженедельно',
    icon: '🎬',
    participants: ['Алексей', 'Анастасия', 'Матвей', 'Даша', 'Илья']
  },
  {
    id: '3',
    title: 'Сказка перед сном',
    description: 'Каждый вечер читаем Илье сказку перед сном',
    frequency: 'Ежедневно',
    icon: '📖',
    participants: ['Анастасия', 'Илья']
  },
  {
    id: '4',
    title: 'Субботняя уборка всей семьёй',
    description: 'По субботам вся семья участвует в уборке дома под весёлую музыку',
    frequency: 'Еженедельно',
    icon: '🧹',
    participants: ['Алексей', 'Анастасия', 'Матвей', 'Даша']
  },
  {
    id: '5',
    title: 'Летний отпуск на море',
    description: 'Каждое лето мы всей семьёй едем отдыхать на Чёрное море',
    frequency: 'Ежегодно',
    icon: '🌊',
    participants: ['Алексей', 'Анастасия', 'Матвей', 'Даша', 'Илья']
  }
];

export const initialMealVotings: MealVoting[] = [
  {
    id: '1',
    question: 'Что приготовить на ужин в пятницу?',
    options: [
      { id: 'a', text: 'Пицца 🍕', votes: 3, voters: ['Матвей', 'Даша', 'Илья'] },
      { id: 'b', text: 'Борщ и котлеты', votes: 2, voters: ['Алексей', 'Анастасия'] },
      { id: 'c', text: 'Паста карбонара', votes: 0, voters: [] }
    ],
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdBy: 'Анастасия'
  },
  {
    id: '2',
    question: 'Куда поехать в выходные?',
    options: [
      { id: 'a', text: 'Дача 🏡', votes: 2, voters: ['Алексей', 'Анастасия'] },
      { id: 'b', text: 'Зоопарк 🦁', votes: 3, voters: ['Матвей', 'Даша', 'Илья'] },
      { id: 'c', text: 'Кино и ТЦ', votes: 0, voters: [] }
    ],
    deadline: new Date(Date.now() + 86400000).toISOString(),
    createdBy: 'Алексей'
  }
];

export const initialChatMessages: ChatMessage[] = [
  { id: '1', sender: 'Анастасия', text: 'Не забудьте, завтра у Даши танцы в 17:00!', timestamp: new Date(Date.now() - 3600000).toISOString(), reactions: { '👍': 2 } },
  { id: '2', sender: 'Алексей', text: 'Отвезу её, я буду свободен', timestamp: new Date(Date.now() - 3000000).toISOString(), reactions: { '❤️': 1 } },
  { id: '3', sender: 'Матвей', text: 'Мама, можно сегодня пригласить друга в гости?', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: '4', sender: 'Анастасия', text: 'Конечно, только сначала уроки!', timestamp: new Date(Date.now() - 900000).toISOString(), reactions: { '📚': 1 } },
  { id: '5', sender: 'Даша', text: 'Я убрала свою комнату! ✨', timestamp: new Date(Date.now() - 600000).toISOString(), reactions: { '🌟': 3 } }
];

export const initialFamilyAlbums: FamilyAlbum[] = [
  {
    id: '1',
    title: 'Отпуск в Сочи 2025',
    coverPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    photoCount: 42,
    date: '2025-07-15',
    description: 'Наш незабываемый отдых на Черном море'
  },
  {
    id: '2',
    title: 'День рождения Матвея',
    coverPhoto: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    photoCount: 28,
    date: '2025-05-14',
    description: '11 лет нашему футболисту!'
  },
  {
    id: '3',
    title: 'Новый год 2026',
    coverPhoto: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800',
    photoCount: 35,
    date: '2025-12-31',
    description: 'Встречали Новый год всей семьёй'
  }
];

export const initialFamilyNeeds: FamilyNeed[] = [
  {
    id: '1',
    category: 'Покупки',
    item: 'Новые кроссовки для Матвея',
    priority: 'high',
    requestedBy: 'Анастасия',
    estimatedCost: 4500,
    status: 'pending'
  },
  {
    id: '2',
    category: 'Здоровье',
    item: 'Записаться к ортодонту для Даши',
    priority: 'medium',
    requestedBy: 'Анастасия',
    status: 'pending'
  },
  {
    id: '3',
    category: 'Образование',
    item: 'Оплатить английский для Матвея',
    priority: 'high',
    requestedBy: 'Алексей',
    estimatedCost: 8000,
    status: 'completed'
  },
  {
    id: '4',
    category: 'Дом',
    item: 'Починить кран в ванной',
    priority: 'high',
    requestedBy: 'Алексей',
    estimatedCost: 2000,
    status: 'in_progress'
  }
];

export const initialFamilyTree: FamilyTreeMember[] = [
  {
    id: '1',
    name: 'Владимир Иванов',
    role: 'Дедушка (отец Алексея)',
    birthYear: 1948,
    avatar: '👴',
    children: ['2']
  },
  {
    id: '2',
    name: 'Алексей Иванов',
    role: 'Отец',
    birthYear: 1983,
    avatar: 'https://cdn.poehali.dev/files/fb82400e-4e48-4d25-9de7-a9991f13aa29.png',
    parents: ['1'],
    spouse: '3',
    children: ['4', '5', '6']
  },
  {
    id: '3',
    name: 'Анастасия Иванова',
    role: 'Мать',
    birthYear: 1988,
    avatar: 'https://cdn.poehali.dev/files/3a7d0304-7fd5-4cd7-ac79-f4c235eb7484.png',
    spouse: '2',
    children: ['4', '5', '6']
  },
  {
    id: '4',
    name: 'Матвей Иванов',
    role: 'Сын',
    birthYear: 2015,
    avatar: 'https://cdn.poehali.dev/files/2c506753-6a4d-447e-a8b2-294bceb38a95.png',
    parents: ['2', '3']
  },
  {
    id: '5',
    name: 'Даша Иванова',
    role: 'Дочь',
    birthYear: 2018,
    avatar: 'https://cdn.poehali.dev/files/fcce342c-9b14-420d-b3eb-97084a3bbe08.png',
    parents: ['2', '3']
  },
  {
    id: '6',
    name: 'Илья Иванов',
    role: 'Сын',
    birthYear: 2021,
    avatar: 'https://cdn.poehali.dev/files/c58eac3b-e952-42aa-abe0-9b1141530809.png',
    parents: ['2', '3']
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Футбольная тренировка Матвея',
    date: new Date(Date.now() + 86400000).toISOString(),
    time: '17:00',
    category: 'Спорт',
    participants: ['Матвей', 'Алексей'],
    location: 'Стадион "Динамо"',
    reminder: true
  },
  {
    id: '2',
    title: 'Танцы для Даши',
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    time: '16:30',
    category: 'Творчество',
    participants: ['Даша', 'Анастасия'],
    location: 'Танцевальная студия "Грация"',
    reminder: true
  },
  {
    id: '3',
    title: 'Родительское собрание',
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    time: '18:00',
    category: 'Учеба',
    participants: ['Алексей', 'Анастасия'],
    location: 'Школа №15, кабинет 204',
    reminder: true
  },
  {
    id: '4',
    title: 'Детский сад - утренник',
    date: new Date(Date.now() + 86400000 * 7).toISOString(),
    time: '10:00',
    category: 'Дети',
    participants: ['Илья', 'Анастасия'],
    location: 'Детский сад №42',
    reminder: true
  },
  {
    id: '5',
    title: 'Семейный ужин у бабушки',
    date: new Date(Date.now() + 86400000 * 3).toISOString(),
    time: '14:00',
    category: 'Семья',
    participants: ['Алексей', 'Анастасия', 'Матвей', 'Даша', 'Илья'],
    location: 'ул. Ленина, 45',
    reminder: true
  }
];

export const initialAIRecommendations: AIRecommendation[] = [
  {
    id: '1',
    title: 'Время для отдыха',
    description: 'Анастасия, вы выполнили 12 задач сегодня. Рекомендуем уделить время себе!',
    category: 'wellness',
    priority: 'medium',
    targetMember: 'Анастасия',
    actionSuggestion: 'Заварите чай и посмотрите любимый сериал'
  },
  {
    id: '2',
    title: 'Активность для Матвея',
    description: 'Матвей проводит много времени за учёбой. Предлагаем добавить физическую активность',
    category: 'health',
    priority: 'high',
    targetMember: 'Матвей',
    actionSuggestion: 'Прогулка в парк или игра в футбол'
  },
  {
    id: '3',
    title: 'Семейное время',
    description: 'Прошло 3 дня без совместного времяпрепровождения. Запланируйте семейный вечер!',
    category: 'family',
    priority: 'medium',
    actionSuggestion: 'Пятничный киновечер или настольные игры'
  }
];

export const initialFamilyGoals: FamilyGoal[] = [
  {
    id: '1',
    title: 'Накопить на отпуск в Турции',
    description: 'Семейный отпуск all inclusive на 10 дней',
    targetAmount: 250000,
    currentAmount: 87500,
    deadline: '2026-06-01',
    category: 'Финансы',
    assignee: 'Вся семья',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Матвей - выучить 500 английских слов',
    description: 'Подготовка к международному экзамену',
    targetAmount: 500,
    currentAmount: 180,
    deadline: '2026-05-01',
    category: 'Образование',
    assignee: 'Матвей',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Семейная традиция - 52 воскресных обеда',
    description: 'Проводить каждое воскресенье вместе за семейным столом',
    targetAmount: 52,
    currentAmount: 8,
    deadline: '2026-12-31',
    category: 'Семья',
    assignee: 'Вся семья',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Даша - освоить 10 танцевальных номеров',
    description: 'Подготовка к городскому конкурсу',
    targetAmount: 10,
    currentAmount: 4,
    deadline: '2026-04-15',
    category: 'Творчество',
    assignee: 'Даша',
    priority: 'medium'
  }
];

export const initialShoppingList: any[] = [];

// Экспорты для обратной совместимости
export const initialFamilyAlbum = initialFamilyAlbums;
export const initialComplaints: any[] = [];

// Utility function
export function getWeekDays(startDate?: Date): Date[] {
  const start = startDate || new Date();
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}