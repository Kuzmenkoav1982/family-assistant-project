import type { CalendarEvent, Task, Reminder } from '@/types/family.types';

export const DEMO_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'День рождения Софии',
    date: '2025-12-05',
    category: 'birthday',
    description: 'София празднует 13 лет! Планируется вечеринка дома с друзьями',
    memberId: 'daughter',
    time: '15:00',
    color: 'pink'
  },
  {
    id: 'cal-2',
    title: 'Рождество',
    date: '2025-01-07',
    category: 'holiday',
    description: 'Семейное празднование Рождества, поход в церковь',
    time: '10:00',
    color: 'red'
  },
  {
    id: 'cal-3',
    title: 'Прием к стоматологу - Максим',
    date: '2025-12-01',
    category: 'health',
    description: 'Профилактический осмотр',
    memberId: 'son',
    time: '14:00',
    color: 'blue'
  },
  {
    id: 'cal-4',
    title: 'Родительское собрание',
    date: '2025-12-15',
    category: 'education',
    description: 'Собрание в школе у Софии',
    memberId: 'daughter',
    time: '18:00',
    color: 'purple'
  },
  {
    id: 'cal-5',
    title: 'Поездка в Суздаль',
    date: '2026-01-03',
    category: 'travel',
    description: 'Семейная поездка на новогодние каникулы',
    time: '09:00',
    color: 'green'
  },
  {
    id: 'cal-6',
    title: 'Годовщина свадьбы',
    date: '2026-06-15',
    category: 'anniversary',
    description: '15 лет вместе! Ужин в ресторане',
    time: '19:00',
    color: 'pink'
  },
  {
    id: 'cal-7',
    title: 'Прием у кардиолога - Николай',
    date: '2025-12-10',
    category: 'health',
    description: 'Плановый осмотр у кардиолога',
    memberId: 'grandpa',
    time: '10:00',
    color: 'red'
  },
  {
    id: 'cal-8',
    title: 'Занятие по плаванию - София',
    date: '2025-11-25',
    category: 'sport',
    description: 'Тренировка в бассейне',
    memberId: 'daughter',
    time: '16:00',
    color: 'blue'
  }
];

export const DEMO_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Купить продукты на неделю',
    completed: false,
    assignedTo: 'mom',
    priority: 'high',
    dueDate: '2025-11-23',
    category: 'shopping',
    description: 'Молоко, хлеб, овощи, фрукты'
  },
  {
    id: 'task-2',
    title: 'Забрать химчистку',
    completed: false,
    assignedTo: 'dad',
    priority: 'medium',
    dueDate: '2025-11-24',
    category: 'house'
  },
  {
    id: 'task-3',
    title: 'Оплатить коммунальные услуги',
    completed: true,
    assignedTo: 'dad',
    priority: 'high',
    dueDate: '2025-11-20',
    category: 'finance'
  },
  {
    id: 'task-4',
    title: 'Приготовить обед на воскресенье',
    completed: false,
    assignedTo: 'grandma',
    priority: 'medium',
    dueDate: '2025-11-24',
    category: 'cooking'
  },
  {
    id: 'task-5',
    title: 'Проверить домашнее задание Софии',
    completed: false,
    assignedTo: 'mom',
    priority: 'high',
    dueDate: '2025-11-22',
    category: 'education'
  },
  {
    id: 'task-6',
    title: 'Записать Максима к педиатру',
    completed: false,
    assignedTo: 'mom',
    priority: 'high',
    dueDate: '2025-11-23',
    category: 'health'
  },
  {
    id: 'task-7',
    title: 'Починить кран на кухне',
    completed: false,
    assignedTo: 'dad',
    priority: 'medium',
    dueDate: '2025-11-25',
    category: 'house'
  },
  {
    id: 'task-8',
    title: 'Купить подарок для Софии',
    completed: false,
    assignedTo: 'mom',
    priority: 'high',
    dueDate: '2025-12-04',
    category: 'shopping'
  }
];

export const DEMO_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Принять лекарства',
    time: '09:00',
    memberId: 'grandma',
    recurring: true,
    enabled: true,
    description: 'Таблетки от давления'
  },
  {
    id: 'rem-2',
    title: 'Полить цветы',
    time: '19:00',
    memberId: 'mom',
    recurring: true,
    enabled: true
  },
  {
    id: 'rem-3',
    title: 'Выгулять собаку',
    time: '07:00',
    memberId: 'dad',
    recurring: true,
    enabled: true
  },
  {
    id: 'rem-4',
    title: 'Позвонить бабушке Вере',
    time: '18:00',
    memberId: 'mom',
    recurring: false,
    enabled: true,
    date: '2025-11-23'
  }
];
