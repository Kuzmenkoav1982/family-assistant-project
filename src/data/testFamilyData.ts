import type { FamilyMember, Task } from '@/types/family.types';

export const testFamilyMembers: FamilyMember[] = [
  {
    id: 'member-1',
    user_id: 'user-1',
    family_id: 'family-kuzmenko',
    name: 'Алексей',
    role: 'Отец',
    avatar: '👨‍💼',
    avatar_type: 'emoji',
    photo_url: null,
    points: 150,
    level: 2,
    workload: 65,
    age: 38,
    achievements: ['Организатор семьи', 'Мастер задач', 'Лидер'],
    foodPreferences: {
      favorites: ['Стейк', 'Паста', 'Пицца'],
      allergies: [],
      restrictions: []
    },
    responsibilities: ['Финансы', 'Ремонт', 'Планирование'],
    moodStatus: {
      emoji: '😊',
      label: 'Отлично',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'member-2',
    user_id: 'user-2',
    family_id: 'family-kuzmenko',
    name: 'Анастасия',
    role: 'Супруга',
    avatar: '👩',
    avatar_type: 'emoji',
    photo_url: null,
    points: 180,
    level: 2,
    workload: 70,
    age: 35,
    achievements: ['Хранительница уюта', 'Мастер кулинарии', 'Организатор'],
    foodPreferences: {
      favorites: ['Салаты', 'Рыба', 'Фрукты'],
      allergies: [],
      restrictions: []
    },
    responsibilities: ['Готовка', 'Воспитание', 'Уборка'],
    moodStatus: {
      emoji: '😃',
      label: 'Хорошо',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'member-3',
    user_id: 'user-3',
    family_id: 'family-kuzmenko',
    name: 'Матвей',
    role: 'Сын',
    avatar: '👦',
    avatar_type: 'emoji',
    photo_url: null,
    points: 90,
    level: 1,
    workload: 45,
    age: 12,
    achievements: ['Юный помощник', 'Отличник'],
    foodPreferences: {
      favorites: ['Пицца', 'Бургеры', 'Мороженое'],
      allergies: [],
      restrictions: []
    },
    responsibilities: ['Уборка комнаты', 'Учёба', 'Помощь по дому'],
    moodStatus: {
      emoji: '😊',
      label: 'Отлично',
      timestamp: new Date().toISOString()
    }
  }
];

export const testTasks: Task[] = [
  {
    id: 'task-1',
    family_id: 'family-kuzmenko',
    title: 'Купить продукты на неделю',
    description: 'Молоко, хлеб, овощи, фрукты',
    assignee: 'member-1',
    assignee_id: 'member-1',
    assignee_name: 'Алексей',
    completed: false,
    category: 'Покупки',
    points: 15,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reminderTime: null,
    shoppingList: ['Молоко', 'Хлеб', 'Овощи', 'Фрукты'],
    isRecurring: false,
    recurringPattern: null,
    nextOccurrence: null,
    priority: 'high',
    cookingDay: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'task-2',
    family_id: 'family-kuzmenko',
    title: 'Приготовить ужин',
    description: 'Паста с овощами',
    assignee: 'member-2',
    assignee_id: 'member-2',
    assignee_name: 'Анастасия',
    completed: false,
    category: 'Готовка',
    points: 20,
    deadline: new Date().toISOString().split('T')[0],
    reminderTime: '18:00',
    shoppingList: null,
    isRecurring: true,
    recurringPattern: {
      frequency: 'daily',
      interval: 1,
      daysOfWeek: null,
      endDate: null
    },
    nextOccurrence: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    cookingDay: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  },
  {
    id: 'task-3',
    family_id: 'family-kuzmenko',
    title: 'Сделать домашнее задание',
    description: 'Математика и русский язык',
    assignee: 'member-3',
    assignee_id: 'member-3',
    assignee_name: 'Матвей',
    completed: true,
    category: 'Учёба',
    points: 25,
    deadline: new Date().toISOString().split('T')[0],
    reminderTime: '16:00',
    shoppingList: null,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1, 2, 3, 4, 5],
      endDate: null
    },
    nextOccurrence: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    cookingDay: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'task-4',
    family_id: 'family-kuzmenko',
    title: 'Убрать квартиру',
    description: 'Пылесос, влажная уборка',
    assignee: 'member-2',
    assignee_id: 'member-2',
    assignee_name: 'Анастасия',
    completed: false,
    category: 'Уборка',
    points: 30,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reminderTime: null,
    shoppingList: null,
    isRecurring: true,
    recurringPattern: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [6],
      endDate: null
    },
    nextOccurrence: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    cookingDay: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'task-5',
    family_id: 'family-kuzmenko',
    title: 'Оплатить коммунальные услуги',
    description: 'Электричество, вода, интернет',
    assignee: 'member-1',
    assignee_id: 'member-1',
    assignee_name: 'Алексей',
    completed: false,
    category: 'Финансы',
    points: 10,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reminderTime: '10:00',
    shoppingList: null,
    isRecurring: true,
    recurringPattern: {
      frequency: 'monthly',
      interval: 1,
      daysOfWeek: null,
      endDate: null
    },
    nextOccurrence: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    cookingDay: null,
    created_at: new Date().toISOString()
  }
];