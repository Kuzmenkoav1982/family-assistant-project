import type { Task, FamilyMember, ImportantDate, ThemeType } from '@/types/family.types';

export const getMemberById = (members: FamilyMember[], id: string) => {
  return members.find(m => m.id === id);
};

export const getWorkloadColor = (workload: number) => {
  if (workload > 70) return 'text-red-600 bg-red-50 border-red-300';
  if (workload > 50) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
  return 'text-green-600 bg-green-50 border-green-300';
};

export const getNextOccurrenceDate = (task: Task): string | undefined => {
  if (!task.recurringPattern) return undefined;
  
  const now = new Date();
  const { frequency, interval, daysOfWeek = [], endDate } = task.recurringPattern;
  
  if (endDate && new Date(endDate) < now) return undefined;
  
  const next = new Date(now);
  
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval);
      break;
    case 'weekly':
      if (daysOfWeek && daysOfWeek.length > 0) {
        const currentDay = next.getDay();
        const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
        const nextDay = sortedDays.find(d => d > currentDay) || sortedDays[0];
        const daysToAdd = nextDay > currentDay 
          ? nextDay - currentDay 
          : 7 - currentDay + nextDay;
        next.setDate(next.getDate() + daysToAdd);
      } else {
        next.setDate(next.getDate() + 7 * interval);
      }
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + interval);
      break;
  }
  
  return next.toISOString().split('T')[0];
};

export const getAISuggestedMeals = (members: FamilyMember[]) => {
  const allFavorites = members.flatMap(m => m.foodPreferences?.favorites || []);
  const favoriteCount = allFavorites.reduce((acc, food) => {
    acc[food] = (acc[food] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const topFavorites = Object.entries(favoriteCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return [
    {
      name: topFavorites[0]?.[0] || 'Пицца',
      reason: `Любимое блюдо ${topFavorites[0]?.[1] || 3} членов семьи`,
      icon: '🍕'
    },
    {
      name: topFavorites[1]?.[0] || 'Паста',
      reason: `Нравится ${topFavorites[1]?.[1] || 2} членам семьи`,
      icon: '🍝'
    },
    {
      name: topFavorites[2]?.[0] || 'Салат',
      reason: `Популярно у ${topFavorites[2]?.[1] || 2} членов семьи`,
      icon: '🥗'
    }
  ];
};

export const showNotification = (options: {
  emoji: string;
  title: string;
  message: string;
  color: string;
}) => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 bg-white border-2 border-${options.color}-500 rounded-lg shadow-2xl p-4 z-[100] animate-fade-in`;
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="text-2xl">${options.emoji}</div>
      <div>
        <p class="font-bold text-sm">${options.title}</p>
        <p class="text-xs text-gray-600">${options.message}</p>
      </div>
    </div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
    notification.style.transition = 'all 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
};

export const menuSections = [
  { id: 'tasks', icon: 'CheckSquare', label: 'Задачи', ready: true },
  { id: 'calendar', icon: 'Calendar', label: 'Календарь', ready: true },
  { id: 'family', icon: 'Users', label: 'Семья', ready: true },
  { id: 'children', icon: 'Baby', label: 'Дети', ready: true },
  { id: 'values', icon: 'Heart', label: 'Ценности', ready: true },
  { id: 'traditions', icon: 'Sparkles', label: 'Традиции', ready: true },
  { id: 'rules', icon: 'Scale', label: 'Правила', ready: true },
  { id: 'blog', icon: 'BookOpen', label: 'Блог', ready: true },
  { id: 'album', icon: 'Image', label: 'Альбом', ready: true },
  { id: 'tree', icon: 'GitBranch', label: 'Древо', ready: true },
  { id: 'chat', icon: 'MessageCircle', label: 'Чат', ready: true },
  { id: 'complaints', icon: 'MessageSquareWarning', label: 'Жалобная книга', ready: true },
  { id: 'about', icon: 'Info', label: 'О проекте', ready: true },
];

export const getSectionTitle = (sectionId: string) => {
  const section = menuSections.find(s => s.id === sectionId);
  return section?.label || 'Семейный Органайзер';
};

export const moodOptions = [
  { emoji: '😊', label: 'Отлично' },
  { emoji: '😃', label: 'Хорошо' },
  { emoji: '😐', label: 'Нормально' },
  { emoji: '😔', label: 'Грустно' },
  { emoji: '😫', label: 'Устал' },
  { emoji: '😤', label: 'Раздражён' },
  { emoji: '🤒', label: 'Болею' },
  { emoji: '🥳', label: 'Празднично' },
];