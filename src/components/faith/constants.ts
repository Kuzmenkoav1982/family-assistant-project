export const CDN = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files';
export const CDN_FAITH = CDN;

export const HERO_IMAGES: Record<string, string> = {
  orthodox: `${CDN}/7f633617-56c0-4321-a54e-df1837492a98.jpg`,
  islam: `${CDN}/18d91cd6-2b80-4bd6-b085-265dbd541d5c.jpg`,
  catholic: `${CDN}/aad5ebfe-ac8e-4fa2-a935-f2a1dbda81fb.jpg`,
  judaism: `${CDN}/e961e6cf-3406-4fb9-a38b-da36466cad03.jpg`,
  buddhism: `${CDN}/a0c58a84-7aa1-42ff-bb15-57d1a21cbcfd.jpg`,
  protestant: `${CDN}/dde09fa3-c8a2-49c7-a1b8-6caff16d1c7e.jpg`,
  hinduism: `${CDN}/d42d2942-00fd-4a1b-8147-d61611c9312b.jpg`,
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
