import func2url from '../../../backend/func2url.json';

export const API_URLS = {
  events: func2url['events'],
  guests: func2url['event-guests'],
  tasks: func2url['event-tasks'],
  expenses: func2url['event-expenses'],
  wishlist: func2url['event-wishlist'],
  guestGifts: func2url['guest-gifts']
};

export function getUserId(): string {
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      return userData.member_id || '1';
    } catch (e) {
      console.error('[getUserId] Failed to parse userData:', e);
    }
  }
  return '1';
}

export const eventTypeLabels: Record<string, string> = {
  birthday: 'День рождения',
  anniversary: 'Юбилей',
  holiday: 'Праздник',
  custom: 'Другое'
};

export const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' }> = {
  planning: { label: 'Планируется', variant: 'default' },
  confirmed: { label: 'Подтверждён', variant: 'success' },
  completed: { label: 'Завершён', variant: 'secondary' },
  cancelled: { label: 'Отменён', variant: 'destructive' }
};

export const guestStatusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'destructive' | 'secondary' }> = {
  invited: { label: 'Приглашён', variant: 'default' },
  confirmed: { label: 'Подтвердил', variant: 'success' },
  declined: { label: 'Отказался', variant: 'destructive' },
  maybe: { label: 'Возможно', variant: 'secondary' }
};

export const taskStatusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' }> = {
  pending: { label: 'Ожидает', variant: 'default' },
  in_progress: { label: 'В работе', variant: 'secondary' },
  completed: { label: 'Выполнено', variant: 'success' }
};

export const categoryLabels: Record<string, string> = {
  venue: 'Место',
  food: 'Еда',
  decorations: 'Декор',
  entertainment: 'Развлечения',
  gifts: 'Подарки',
  other: 'Прочее'
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};
