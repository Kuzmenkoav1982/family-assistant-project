export const CDN = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files';
export const CDN_FAITH = CDN;

export const HERO_IMAGES: Record<string, string> = {
  orthodox: `${CDN}/ccabfec6-3f8c-4979-bd69-8685363b2fb0.jpg`,
  islam: `${CDN}/f9f494ef-d453-4112-afb0-c1e0afa7f85b.jpg`,
  catholic: `${CDN}/371c1699-f41a-4092-bd82-91a32b8b8c9e.jpg`,
  judaism: `${CDN}/4b4f0674-7288-475f-9ba1-b9c351c0a6e0.jpg`,
  buddhism: `${CDN}/789ffe46-2893-4d70-b3fc-d590943e658d.jpg`,
  protestant: `${CDN}/045fe9d6-9651-475d-874b-fbcd8978c1a6.jpg`,
  hinduism: `${CDN}/1900062f-425f-4bee-9b00-348a033b33d5.jpg`,
};

export const RELIGIONS = [
  { key: 'orthodox', label: 'Православие', emoji: '☦️' },
  { key: 'islam', label: 'Ислам', emoji: '☪️' },
  { key: 'catholic', label: 'Католицизм', emoji: '✝️' },
  { key: 'judaism', label: 'Иудаизм', emoji: '✡️' },
  { key: 'buddhism', label: 'Буддизм', emoji: '☸️' },
  { key: 'protestant', label: 'Протестантизм', emoji: '⛪' },
  { key: 'hinduism', label: 'Индуизм', emoji: '🕉️' },
];

export const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export const PRAYER_CATEGORIES = [
  { key: 'all', label: 'Все', icon: 'BookOpen' },
  { key: 'morning', label: 'Утренние', icon: 'Sunrise' },
  { key: 'evening', label: 'Вечерние', icon: 'Moon' },
  { key: 'meal', label: 'Трапеза', icon: 'UtensilsCrossed' },
  { key: 'general', label: 'Основные', icon: 'Heart' },
  { key: 'family', label: 'О семье', icon: 'Users' },
];

export const BOOK_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  sacred: { label: 'Священное Писание', icon: 'BookMarked', color: 'amber' },
  study: { label: 'Для изучения', icon: 'GraduationCap', color: 'blue' },
  classic: { label: 'Классика', icon: 'Library', color: 'violet' },
  modern: { label: 'Современные', icon: 'Sparkles', color: 'emerald' },
  prayer: { label: 'Молитвословы', icon: 'Heart', color: 'rose' },
};

export const TEXT_CATEGORIES: Record<string, { label: string; icon: string }> = {
  all: { label: 'Все', icon: 'BookOpen' },
  prayer: { label: 'Молитвы', icon: 'Heart' },
  commandment: { label: 'Заповеди', icon: 'ScrollText' },
  bible: { label: 'Библия', icon: 'BookMarked' },
  quran: { label: 'Коран', icon: 'BookMarked' },
  torah: { label: 'Тора', icon: 'BookMarked' },
  sutra: { label: 'Сутры', icon: 'BookMarked' },
  scripture: { label: 'Писание', icon: 'BookMarked' },
};

export const TAB_LIST = [
  { value: 'overview', icon: 'Home', label: 'Главная' },
  { value: 'texts', icon: 'BookText', label: 'Тексты' },
  { value: 'saint', icon: 'Crown', label: 'Святые' },
  { value: 'icon', icon: 'Image', label: 'Икона' },
  { value: 'holidays', icon: 'CalendarDays', label: 'Праздники' },
  { value: 'fasting', icon: 'Flame', label: 'Посты' },
  { value: 'prayers', icon: 'BookOpen', label: 'Молитвы' },
  { value: 'library', icon: 'Library', label: 'Основы' },
  { value: 'namedays', icon: 'Baby', label: 'Именины' },
  { value: 'temple', icon: 'Church', label: 'Храм' },
];

export function getReligionLabel(key: string): string {
  return RELIGIONS.find(r => r.key === key)?.label || key;
}

export function getReligionEmoji(key: string): string {
  return RELIGIONS.find(r => r.key === key)?.emoji || '';
}