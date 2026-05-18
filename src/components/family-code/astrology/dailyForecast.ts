import { ZODIAC_DATA } from '@/lib/astrology';
import type { ZodiacSign } from '@/types/family-code.types';

const DAILY_MOODS = [
  'Гармоничный', 'Вдохновлённый', 'Спокойный', 'Энергичный', 'Задумчивый',
  'Творческий', 'Решительный', 'Мечтательный', 'Радостный', 'Сосредоточенный',
  'Романтичный', 'Деловой',
];

const DAILY_COLORS = [
  'Синий', 'Зелёный', 'Золотой', 'Фиолетовый', 'Бирюзовый',
  'Алый', 'Серебристый', 'Лавандовый', 'Персиковый', 'Изумрудный',
  'Коралловый', 'Янтарный',
];

const DAILY_ADVICES = [
  'Доверяйте своей интуиции сегодня — она вас не подведёт.',
  'Отличный день для семейных дел и домашнего уюта.',
  'Сосредоточьтесь на одной важной задаче — результат превзойдёт ожидания.',
  'Проявите инициативу — сегодня вас поддержат.',
  'Уделите время творчеству, даже если это всего 15 минут.',
  'Позвоните тому, по кому давно скучаете.',
  'Сегодня ваша энергия заразительна — делитесь ей с близкими.',
  'Не бойтесь мечтать масштабно — звёзды на вашей стороне.',
  'Маленький сюрприз для близкого человека принесёт вам обоим радость.',
  'Найдите время для прогулки — свежий воздух перезарядит вас.',
  'Будьте терпеливы — всё, что нужно, придёт в своё время.',
  'Запишите свои идеи — среди них есть золотая.',
];

function getDailyHash(dateStr: string, signIndex: number): number {
  const parts = dateStr.split('-');
  const seed = parseInt(parts[0]) * 367 + parseInt(parts[1]) * 31 + parseInt(parts[2]);
  return Math.abs((seed * 2654435761 + signIndex * 40503) % 2147483647);
}

export function getDailyForecast(zodiacSign: ZodiacSign) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const signIndex = ZODIAC_DATA.findIndex(z => z.id === zodiacSign);
  const hash = getDailyHash(dateStr, signIndex);

  const mood = DAILY_MOODS[hash % DAILY_MOODS.length];
  const energy = (hash % 5) + 1;
  const color = DAILY_COLORS[(hash >> 3) % DAILY_COLORS.length];
  const advice = DAILY_ADVICES[(hash >> 6) % DAILY_ADVICES.length];

  return { mood, energy, color, advice };
}
