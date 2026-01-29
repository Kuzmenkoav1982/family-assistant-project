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
    date: '2026-01-07',
    category: 'holiday',
    description: 'Семейное празднование Рождества, поход в церковь',
    time: '10:00',
    color: 'red'
  },
  {
    id: 'cal-3',
    title: 'Прием к стоматологу - Матвей',
    date: '2026-02-15',
    category: 'health',
    description: 'Профилактический осмотр',
    memberId: '3',
    time: '14:00',
    color: 'blue'
  },
  {
    id: 'cal-4',
    title: 'Родительское собрание',
    date: '2026-02-20',
    category: 'education',
    description: 'Собрание в школе у Матвея',
    memberId: '3',
    time: '18:00',
    color: 'purple'
  },
  {
    id: 'cal-5',
    title: 'Поездка в Казань',
    date: '2026-02-10',
    category: 'travel',
    description: 'Семейная поездка на выходные',
    time: '09:00',
    color: 'green'
  },
  {
    id: 'cal-6',
    title: 'День рождения Алексея',
    date: '2026-03-12',
    category: 'birthday',
    description: 'Празднование дня рождения папы',
    memberId: '2',
    time: '19:00',
    color: 'blue'
  },
  {
    id: 'cal-7',
    title: 'Семейный ужин',
    date: '2026-02-01',
    category: 'general',
    description: 'Ужин всей семьей в ресторане',
    time: '18:30',
    color: 'orange'
  },
  {
    id: 'cal-8',
    title: 'Футбольный матч - Матвей',
    date: '2026-02-08',
    category: 'sport',
    description: 'Соревнования по футболу',
    memberId: '3',
    time: '16:00',
    color: 'green'
  },
  {
    id: 'cal-9',
    title: 'День рождения Анастасии',
    date: '2026-04-22',
    category: 'birthday',
    description: 'Празднование дня рождения мамы',
    memberId: '1',
    time: '17:00',
    color: 'pink'
  },
  {
    id: 'cal-10',
    title: 'Музей космонавтики',
    date: '2026-02-14',
    category: 'leisure',
    description: 'Семейный поход в музей',
    time: '11:00',
    color: 'purple'
  },
  {
    id: 'cal-11',
    title: 'Прививка - Илья',
    date: '2026-02-18',
    category: 'health',
    description: 'Плановая вакцинация',
    memberId: '5',
    time: '10:30',
    color: 'red'
  },
  {
    id: 'cal-12',
    title: 'Покупка мебели',
    date: '2026-02-25',
    category: 'shopping',
    description: 'Выбрать диван для гостиной',
    time: '14:00',
    color: 'orange'
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