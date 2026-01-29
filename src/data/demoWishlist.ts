export interface WishlistItem {
  id: number;
  destination: string;
  country: string;
  description?: string;
  priority: string;
  estimated_budget?: number;
  currency: string;
  best_season?: string;
  duration_days?: number;
  tags?: string;
  image_url?: string;
}

export const DEMO_WISHLIST: WishlistItem[] = [
  {
    id: 1,
    destination: 'Байкал',
    country: 'Россия',
    description: 'Увидеть самое глубокое озеро в мире, попробовать местную кухню, познакомиться с бурятской культурой',
    priority: 'high',
    estimated_budget: 150000,
    currency: 'RUB',
    best_season: 'Лето (июнь-август)',
    duration_days: 10,
    tags: 'природа, культура, активный отдых',
    image_url: 'https://images.unsplash.com/photo-1612967370355-3fd5e00c1e6e?w=800'
  },
  {
    id: 2,
    destination: 'Санкт-Петербург',
    country: 'Россия',
    description: 'Посетить Эрмитаж, прогуляться по Невскому проспекту, увидеть развод мостов',
    priority: 'high',
    estimated_budget: 120000,
    currency: 'RUB',
    best_season: 'Белые ночи (май-июль)',
    duration_days: 7,
    tags: 'культура, музеи, история',
    image_url: 'https://images.unsplash.com/photo-1555211259-7aa2e2d6a380?w=800'
  },
  {
    id: 3,
    destination: 'Алтай',
    country: 'Россия',
    description: 'Горный треккинг, сплавы по рекам, посещение Телецкого озера и водопадов',
    priority: 'medium',
    estimated_budget: 100000,
    currency: 'RUB',
    best_season: 'Лето (июль-август)',
    duration_days: 12,
    tags: 'активный отдых, природа, горы',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
  },
  {
    id: 4,
    destination: 'Крым',
    country: 'Россия',
    description: 'Пляжный отдых, посещение Ласточкиного гнезда, дегустация вин, Херсонес',
    priority: 'high',
    estimated_budget: 180000,
    currency: 'RUB',
    best_season: 'Лето (июнь-сентябрь)',
    duration_days: 14,
    tags: 'пляж, история, вино',
    image_url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800'
  },
  {
    id: 5,
    destination: 'Камчатка',
    country: 'Россия',
    description: 'Вулканы, Долина гейзеров, медвежья рыбалка, термальные источники',
    priority: 'low',
    estimated_budget: 300000,
    currency: 'RUB',
    best_season: 'Лето (июль-сентябрь)',
    duration_days: 14,
    tags: 'природа, вулканы, приключения',
    image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'
  },
  {
    id: 6,
    destination: 'Карелия',
    country: 'Россия',
    description: 'Остров Кижи, Валаам, рыбалка, карельская кухня, деревянное зодчество',
    priority: 'medium',
    estimated_budget: 90000,
    currency: 'RUB',
    best_season: 'Лето (июнь-август)',
    duration_days: 7,
    tags: 'природа, история, рыбалка',
    image_url: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=800'
  },
  {
    id: 7,
    destination: 'Казань',
    country: 'Россия',
    description: 'Казанский Кремль, мечеть Кул-Шариф, татарская кухня, улица Баумана',
    priority: 'high',
    estimated_budget: 70000,
    currency: 'RUB',
    best_season: 'Весна-Осень',
    duration_days: 5,
    tags: 'культура, кухня, история',
    image_url: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800'
  },
  {
    id: 8,
    destination: 'Выборг',
    country: 'Россия',
    description: 'Средневековый замок, парк Монрепо, скандинавская архитектура, крендели',
    priority: 'medium',
    estimated_budget: 50000,
    currency: 'RUB',
    best_season: 'Лето (май-сентябрь)',
    duration_days: 3,
    tags: 'история, архитектура, однодневная поездка',
    image_url: 'https://images.unsplash.com/photo-1585128720678-766b8d4b4b6b?w=800'
  },
  {
    id: 9,
    destination: 'Сочи',
    country: 'Россия',
    description: 'Морской отдых, Олимпийский парк, Роза Хутор зимой, дендрарий',
    priority: 'medium',
    estimated_budget: 200000,
    currency: 'RUB',
    best_season: 'Круглый год',
    duration_days: 10,
    tags: 'пляж, горы, активный отдых',
    image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800'
  },
  {
    id: 10,
    destination: 'Великий Новгород',
    country: 'Россия',
    description: 'Древнейший русский город, Кремль, Ярославово дворище, монастыри',
    priority: 'low',
    estimated_budget: 60000,
    currency: 'RUB',
    best_season: 'Лето (май-сентябрь)',
    duration_days: 4,
    tags: 'история, культура, архитектура',
    image_url: 'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800'
  }
];
