import type { TraditionItem } from '@/lib/familyTraditions/api';

/**
 * Стартовые традиции — используются только если сервер и localStorage пусты.
 * Импортируется в FamilyTraditionsProvider (через App.tsx) и в Culture.tsx
 * как примеры для отображения в пустом состоянии.
 */
export const DEFAULT_TRADITIONS: TraditionItem[] = [
  {
    id: 'default-1',
    name: 'Воскресный семейный обед',
    description: 'Каждое воскресенье мы собираемся всей семьей за большим столом',
    icon: '🍽️',
    frequency: 'weekly',
    nextDate: '',
    participants: [],
  },
  {
    id: 'default-2',
    name: 'Пятничный киновечер',
    description: 'Каждую пятницу вечером смотрим семейный фильм с попкорном',
    icon: '🎬',
    frequency: 'weekly',
    nextDate: '',
    participants: [],
  },
  {
    id: 'default-3',
    name: 'Сказка перед сном',
    description: 'Каждый вечер читаем сказку перед сном',
    icon: '📖',
    frequency: 'weekly',
    nextDate: '',
    participants: [],
  },
];
