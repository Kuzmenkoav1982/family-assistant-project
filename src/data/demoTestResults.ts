export const demoTestResults = [
  {
    id: '1',
    testId: 'emotional-intelligence',
    testName: 'Эмоциональный интеллект',
    memberId: '2',
    memberName: 'Анастасия',
    completedAt: '2025-01-20',
    score: 85,
    maxScore: 100,
    results: {
      summary: 'Высокий уровень эмоционального интеллекта',
      strengths: ['Эмпатия', 'Самоконтроль', 'Социальные навыки'],
      improvements: ['Мотивация'],
      recommendations: [
        'Продолжайте развивать навыки активного слушания',
        'Практикуйте техники осознанности для повышения самоконтроля'
      ]
    }
  },
  {
    id: '2',
    testId: 'communication-style',
    testName: 'Стиль общения',
    memberId: '1',
    memberName: 'Алексей',
    completedAt: '2025-01-18',
    score: 72,
    maxScore: 100,
    results: {
      summary: 'Директивный стиль с элементами сотрудничества',
      strengths: ['Ясность', 'Прямота', 'Решительность'],
      improvements: ['Активное слушание', 'Гибкость'],
      recommendations: [
        'Уделяйте больше времени выслушиванию других',
        'Практикуйте открытые вопросы в диалоге'
      ]
    }
  },
  {
    id: '3',
    testId: 'love-languages',
    testName: 'Языки любви',
    memberId: '2',
    memberName: 'Анастасия',
    completedAt: '2025-01-15',
    score: 0,
    maxScore: 0,
    results: {
      primary: 'Акты служения',
      secondary: 'Слова поддержки',
      distribution: {
        'Слова поддержки': 20,
        'Время вместе': 15,
        'Подарки': 10,
        'Акты служения': 35,
        'Прикосновения': 20
      },
      recommendations: [
        'Ваш партнёр может проявлять любовь через помощь по дому',
        'Цените бытовые заботы как проявление любви'
      ]
    }
  },
  {
    id: '4',
    testId: 'parenting-style',
    testName: 'Стиль воспитания',
    memberId: '1',
    memberName: 'Алексей',
    completedAt: '2025-01-12',
    score: 78,
    maxScore: 100,
    results: {
      summary: 'Авторитетный стиль воспитания',
      strengths: ['Чёткие границы', 'Эмоциональная поддержка', 'Последовательность'],
      improvements: ['Гибкость в правилах'],
      recommendations: [
        'Отличный баланс между требованиями и теплотой',
        'Продолжайте объяснять детям причины правил'
      ]
    }
  },
  {
    id: '5',
    testId: 'time-management',
    testName: 'Управление временем',
    memberId: '2',
    memberName: 'Анастасия',
    completedAt: '2025-01-10',
    score: 68,
    maxScore: 100,
    results: {
      summary: 'Средний уровень организованности',
      strengths: ['Планирование', 'Расстановка приоритетов'],
      improvements: ['Делегирование', 'Борьба с прокрастинацией'],
      recommendations: [
        'Используйте технику Pomodoro для продуктивности',
        'Делегируйте больше задач членам семьи',
        'Планируйте время для отдыха'
      ]
    }
  },
  {
    id: '6',
    testId: 'conflict-resolution',
    testName: 'Разрешение конфликтов',
    memberId: '1',
    memberName: 'Алексей',
    completedAt: '2025-01-08',
    score: 74,
    maxScore: 100,
    results: {
      summary: 'Конструктивный подход к конфликтам',
      strengths: ['Поиск компромиссов', 'Спокойствие'],
      improvements: ['Эмпатия', 'Признание ошибок'],
      recommendations: [
        'Практикуйте технику "Я-сообщений"',
        'Признавайте эмоции других перед решением проблемы'
      ]
    }
  },
  {
    id: '7',
    testId: 'stress-management',
    testName: 'Управление стрессом',
    memberId: '2',
    memberName: 'Анастасия',
    completedAt: '2025-01-05',
    score: 62,
    maxScore: 100,
    results: {
      summary: 'Средняя устойчивость к стрессу',
      strengths: ['Физическая активность', 'Социальная поддержка'],
      improvements: ['Техники релаксации', 'Границы'],
      recommendations: [
        'Освойте дыхательные упражнения',
        'Установите чёткие границы между работой и домом',
        'Регулярно практикуйте хобби для восстановления'
      ]
    }
  },
  {
    id: '8',
    testId: 'financial-literacy',
    testName: 'Финансовая грамотность',
    memberId: '1',
    memberName: 'Алексей',
    completedAt: '2025-01-03',
    score: 82,
    maxScore: 100,
    results: {
      summary: 'Хороший уровень финансовой грамотности',
      strengths: ['Бюджетирование', 'Инвестиции', 'Долгосрочное планирование'],
      improvements: ['Страхование'],
      recommendations: [
        'Рассмотрите варианты страхования жизни',
        'Продолжайте следить за семейным бюджетом',
        'Обсудите с семьёй финансовые цели на год'
      ]
    }
  }
];

export const demoTestSchedule = [
  {
    id: '1',
    testId: 'emotional-intelligence',
    testName: 'Эмоциональный интеллект',
    memberId: '3',
    memberName: 'Матвей',
    scheduledFor: '2025-02-01',
    status: 'scheduled',
    reminder: true
  },
  {
    id: '2',
    testId: 'communication-style',
    testName: 'Стиль общения',
    memberId: '4',
    memberName: 'Даша',
    scheduledFor: '2025-02-05',
    status: 'scheduled',
    reminder: true
  },
  {
    id: '3',
    testId: 'love-languages',
    testName: 'Языки любви',
    memberId: '1',
    memberName: 'Алексей',
    scheduledFor: '2025-02-10',
    status: 'scheduled',
    reminder: false
  }
];

export const demoTestStats = {
  totalTests: 8,
  completedTests: 8,
  averageScore: 75,
  lastTestDate: '2025-01-20',
  participationRate: {
    'Алексей': 4,
    'Анастасия': 4,
    'Матвей': 0,
    'Даша': 0,
    'Илья': 0
  }
};
