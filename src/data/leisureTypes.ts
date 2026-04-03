export interface LeisureActivity {
  id: number;
  title: string;
  category: string;
  location?: string;
  date?: string;
  time?: string;
  price?: number;
  currency: string;
  rating?: number;
  status: string;
  notes?: string;
  website?: string;
  phone?: string;
  booking_required: boolean;
  booking_url?: string;
  created_at: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  participants?: string[];
  share_token?: string;
  is_public?: boolean;
  show_in_calendar?: boolean;
  visible_to?: string[];
}

export interface NewActivityForm {
  title: string;
  category: string;
  location: string;
  date: string;
  time: string;
  price: string;
  currency: string;
  status: string;
  notes: string;
  website: string;
  phone: string;
  booking_required: boolean;
  booking_url: string;
  latitude: string;
  longitude: string;
  tags: string[];
  participants: string[];
  show_in_calendar: boolean;
  visible_to: string[];
}

export const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';

export const CATEGORIES = [
  { value: 'event', label: 'Мероприятие', icon: 'CalendarDays' },
  { value: 'restaurant', label: 'Ресторан', icon: 'UtensilsCrossed' },
  { value: 'attraction', label: 'Достопримечательность', icon: 'Landmark' },
  { value: 'entertainment', label: 'Развлечение', icon: 'Gamepad2' },
  { value: 'sport', label: 'Спорт', icon: 'Dumbbell' },
  { value: 'culture', label: 'Культура', icon: 'Theater' },
  { value: 'other', label: 'Другое', icon: 'MapPin' },
];

export const TABS_CONFIG = [
  { value: 'want_to_go', label: 'Хочу посетить', icon: 'Heart' },
  { value: 'planned', label: 'Запланировано', icon: 'CalendarCheck' },
  { value: 'visited', label: 'Посещено', icon: 'Check' },
  { value: 'all', label: 'Все', icon: 'List' },
];

export const VIEW_MODES = [
  { value: 'grid', icon: 'Grid3x3', label: 'Сетка' },
  { value: 'map', icon: 'Map', label: 'Карта' },
  { value: 'calendar', icon: 'Calendar', label: 'Календарь' },
  { value: 'stats', icon: 'BarChart3', label: 'Статистика' },
];

export const INITIAL_NEW_ACTIVITY: NewActivityForm = {
  title: '', category: 'event', location: '', date: '', time: '',
  price: '', currency: 'RUB', status: 'want_to_go', notes: '',
  website: '', phone: '', booking_required: false, booking_url: '',
  latitude: '', longitude: '', tags: [], participants: [],
  show_in_calendar: false, visible_to: [],
};

export function getCategoryInfo(category: string) {
  return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
}

export function getStatusBadge(status: string) {
  const badges = {
    want_to_go: { label: 'Хочу посетить', variant: 'outline' as const },
    planned: { label: 'Запланировано', variant: 'default' as const },
    visited: { label: 'Посещено', variant: 'secondary' as const },
  };
  return badges[status as keyof typeof badges] || badges.want_to_go;
}
