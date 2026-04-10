import type { AstrologyProfile, ZodiacSign, ChineseAnimal, Element } from '@/types/family-code.types';

interface ZodiacData {
  id: ZodiacSign;
  label: string;
  emoji: string;
  element: Element;
  planet: string;
  dateRange: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  traits: string[];
  description: string;
}

const ZODIAC_DATA: ZodiacData[] = [
  { id: 'aries', label: 'Овен', emoji: '♈', element: 'fire', planet: 'Марс', dateRange: '21.03 – 19.04', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19, traits: ['Энергичный', 'Смелый', 'Инициативный', 'Нетерпеливый'], description: 'Первопроходец зодиака. Лидер по природе, полный энергии и решимости. Идёт напролом к цели, зажигает других своим энтузиазмом.' },
  { id: 'taurus', label: 'Телец', emoji: '♉', element: 'earth', planet: 'Венера', dateRange: '20.04 – 20.05', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20, traits: ['Надёжный', 'Терпеливый', 'Практичный', 'Упрямый'], description: 'Скала стабильности. Ценит комфорт, красоту и материальную надёжность. Верный партнёр и заботливый родитель.' },
  { id: 'gemini', label: 'Близнецы', emoji: '♊', element: 'air', planet: 'Меркурий', dateRange: '21.05 – 20.06', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20, traits: ['Общительный', 'Любознательный', 'Адаптивный', 'Непостоянный'], description: 'Вечный исследователь. Блестящий интеллект, дар коммуникации, любовь к разнообразию. Два человека в одном.' },
  { id: 'cancer', label: 'Рак', emoji: '♋', element: 'water', planet: 'Луна', dateRange: '21.06 – 22.07', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22, traits: ['Заботливый', 'Интуитивный', 'Эмоциональный', 'Ранимый'], description: 'Хранитель семьи. Глубокая эмоциональность, сильная интуиция, преданность близким. Дом — его крепость.' },
  { id: 'leo', label: 'Лев', emoji: '♌', element: 'fire', planet: 'Солнце', dateRange: '23.07 – 22.08', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22, traits: ['Яркий', 'Щедрый', 'Уверенный', 'Горделивый'], description: 'Царь зодиака. Харизма, щедрость, творческий потенциал. Любит быть в центре внимания и дарить тепло.' },
  { id: 'virgo', label: 'Дева', emoji: '♍', element: 'earth', planet: 'Меркурий', dateRange: '23.08 – 22.09', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22, traits: ['Аналитичный', 'Трудолюбивый', 'Скромный', 'Критичный'], description: 'Мастер деталей. Острый ум, любовь к порядку, стремление к совершенству. Незаменимый помощник и советчик.' },
  { id: 'libra', label: 'Весы', emoji: '♎', element: 'air', planet: 'Венера', dateRange: '23.09 – 22.10', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22, traits: ['Дипломатичный', 'Справедливый', 'Гармоничный', 'Нерешительный'], description: 'Искатель баланса. Ценит красоту, справедливость и гармонию. Прирождённый миротворец и эстет.' },
  { id: 'scorpio', label: 'Скорпион', emoji: '♏', element: 'water', planet: 'Плутон', dateRange: '23.10 – 21.11', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21, traits: ['Страстный', 'Проницательный', 'Целеустремлённый', 'Ревнивый'], description: 'Трансформатор. Глубина чувств, магнетизм, способность к перерождению. Видит суть вещей насквозь.' },
  { id: 'sagittarius', label: 'Стрелец', emoji: '♐', element: 'fire', planet: 'Юпитер', dateRange: '22.11 – 21.12', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21, traits: ['Оптимистичный', 'Свободолюбивый', 'Философский', 'Бестактный'], description: 'Вечный путешественник. Жажда знаний, оптимизм, широта взглядов. Видит жизнь как приключение.' },
  { id: 'capricorn', label: 'Козерог', emoji: '♑', element: 'earth', planet: 'Сатурн', dateRange: '22.12 – 19.01', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19, traits: ['Амбициозный', 'Дисциплинированный', 'Ответственный', 'Замкнутый'], description: 'Покоритель вершин. Упорство, дисциплина, долгосрочное мышление. С возрастом только расцветает.' },
  { id: 'aquarius', label: 'Водолей', emoji: '♒', element: 'air', planet: 'Уран', dateRange: '20.01 – 18.02', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18, traits: ['Оригинальный', 'Независимый', 'Гуманистичный', 'Отстранённый'], description: 'Визионер будущего. Нестандартное мышление, любовь к свободе, стремление менять мир к лучшему.' },
  { id: 'pisces', label: 'Рыбы', emoji: '♓', element: 'water', planet: 'Нептун', dateRange: '19.02 – 20.03', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20, traits: ['Творческий', 'Сочувствующий', 'Интуитивный', 'Мечтательный'], description: 'Мистик зодиака. Безграничная фантазия, эмпатия, духовная глубина. Чувствует то, что другие не замечают.' },
];

interface ChineseAnimalData {
  id: ChineseAnimal;
  label: string;
  emoji: string;
  traits: string[];
  description: string;
}

const CHINESE_ANIMALS: ChineseAnimalData[] = [
  { id: 'rat', label: 'Крыса', emoji: '🐀', traits: ['Сообразительный', 'Находчивый', 'Бережливый'], description: 'Умная, находчивая, обаятельная. Прекрасный стратег с острым чутьём на возможности.' },
  { id: 'ox', label: 'Бык', emoji: '🐂', traits: ['Трудолюбивый', 'Надёжный', 'Терпеливый'], description: 'Упорный, надёжный, трудолюбивый. Достигает всего честным трудом и настойчивостью.' },
  { id: 'tiger', label: 'Тигр', emoji: '🐅', traits: ['Смелый', 'Авторитетный', 'Эмоциональный'], description: 'Храбрый, харизматичный лидер. Притягивает к себе людей силой духа и уверенностью.' },
  { id: 'rabbit', label: 'Кролик', emoji: '🐇', traits: ['Добрый', 'Элегантный', 'Осторожный'], description: 'Утончённый, дипломатичный, миролюбивый. Умеет находить гармонию в любой ситуации.' },
  { id: 'dragon', label: 'Дракон', emoji: '🐉', traits: ['Энергичный', 'Уверенный', 'Амбициозный'], description: 'Самый сильный знак. Полон энергии, амбиций и великих замыслов. Прирождённый лидер.' },
  { id: 'snake', label: 'Змея', emoji: '🐍', traits: ['Мудрый', 'Интуитивный', 'Загадочный'], description: 'Мудрая, проницательная, элегантная. Обладает глубокой интуицией и внутренней силой.' },
  { id: 'horse', label: 'Лошадь', emoji: '🐎', traits: ['Активный', 'Весёлый', 'Свободолюбивый'], description: 'Энергичная, жизнерадостная, свободолюбивая. Не терпит скуки и ограничений.' },
  { id: 'goat', label: 'Коза', emoji: '🐐', traits: ['Творческий', 'Мягкий', 'Романтичный'], description: 'Творческая, мечтательная, добрая натура. Ценит красоту и гармонию во всём.' },
  { id: 'monkey', label: 'Обезьяна', emoji: '🐒', traits: ['Хитрый', 'Изобретательный', 'Весёлый'], description: 'Блестящий ум, чувство юмора, изобретательность. Находит выход из любой ситуации.' },
  { id: 'rooster', label: 'Петух', emoji: '🐓', traits: ['Честный', 'Яркий', 'Пунктуальный'], description: 'Прямолинейный, организованный, трудолюбивый. Всегда говорит правду и держит слово.' },
  { id: 'dog', label: 'Собака', emoji: '🐕', traits: ['Верный', 'Честный', 'Защитник'], description: 'Верный друг и защитник. Справедливый, ответственный, готов помочь каждому.' },
  { id: 'pig', label: 'Свинья', emoji: '🐷', traits: ['Щедрый', 'Добродушный', 'Искренний'], description: 'Добродушная, щедрая, искренняя. Ценит простые радости жизни и настоящую дружбу.' },
];

const CHINESE_ELEMENTS: { element: Element; label: string }[] = [
  { element: 'wood', label: 'Дерево' },
  { element: 'fire', label: 'Огонь' },
  { element: 'earth', label: 'Земля' },
  { element: 'metal', label: 'Металл' },
  { element: 'water', label: 'Вода' },
];

const ELEMENT_LABELS: Record<Element, string> = {
  fire: 'Огонь',
  earth: 'Земля',
  air: 'Воздух',
  water: 'Вода',
  wood: 'Дерево',
  metal: 'Металл',
};

export function getElementLabel(element: Element): string {
  return ELEMENT_LABELS[element] || element;
}

export function getZodiacSign(birthDate: string): ZodiacData | null {
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) return null;
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return ZODIAC_DATA.find(z => {
    if (z.startMonth === z.endMonth) {
      return m === z.startMonth && d >= z.startDay && d <= z.endDay;
    }
    if (z.startMonth < z.endMonth) {
      return (m === z.startMonth && d >= z.startDay) || (m === z.endMonth && d <= z.endDay);
    }
    return (m === z.startMonth && d >= z.startDay) || (m === z.endMonth && d <= z.endDay);
  }) || null;
}

export function getChineseAnimal(year: number): ChineseAnimalData {
  const idx = (year - 1900) % 12;
  return CHINESE_ANIMALS[idx < 0 ? idx + 12 : idx];
}

export function getChineseElement(year: number): { element: Element; label: string } {
  const idx = Math.floor(((year - 1924) % 10) / 2);
  return CHINESE_ELEMENTS[idx < 0 ? idx + 5 : idx];
}

export function getChineseYinYang(year: number): 'yin' | 'yang' {
  return year % 2 === 0 ? 'yang' : 'yin';
}

export function calculateAstrologyProfile(birthDate: string): AstrologyProfile | null {
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) return null;

  const zodiac = getZodiacSign(birthDate);
  if (!zodiac) return null;

  const year = date.getFullYear();
  const animal = getChineseAnimal(year);
  const chElement = getChineseElement(year);
  const yinYang = getChineseYinYang(year);

  return {
    zodiacSign: zodiac.id,
    zodiacSignLabel: zodiac.label,
    zodiacEmoji: zodiac.emoji,
    zodiacElement: zodiac.element,
    zodiacPlanet: zodiac.planet,
    zodiacDescription: zodiac.description,
    chineseAnimal: animal.id,
    chineseAnimalLabel: animal.label,
    chineseAnimalEmoji: animal.emoji,
    chineseElement: chElement.element,
    chineseYinYang: yinYang,
    chineseDescription: animal.description,
    calculatedAt: new Date().toISOString(),
  };
}

export function getZodiacCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): number {
  const z1 = ZODIAC_DATA.find(z => z.id === sign1);
  const z2 = ZODIAC_DATA.find(z => z.id === sign2);
  if (!z1 || !z2) return 50;

  if (z1.element === z2.element) return 85;

  const compatible: Record<Element, Element[]> = {
    fire: ['air'],
    air: ['fire'],
    earth: ['water'],
    water: ['earth'],
    wood: ['water', 'fire'],
    metal: ['earth', 'water'],
  };

  if (compatible[z1.element]?.includes(z2.element)) return 75;

  const idx1 = ZODIAC_DATA.indexOf(z1);
  const idx2 = ZODIAC_DATA.indexOf(z2);
  const diff = Math.abs(idx1 - idx2);
  if (diff === 4 || diff === 8) return 80;
  if (diff === 6) return 45;

  return 60;
}

export function getChineseCompatibility(a1: ChineseAnimal, a2: ChineseAnimal): number {
  const bestPairs: [ChineseAnimal, ChineseAnimal][] = [
    ['rat', 'dragon'], ['rat', 'monkey'],
    ['ox', 'snake'], ['ox', 'rooster'],
    ['tiger', 'horse'], ['tiger', 'dog'],
    ['rabbit', 'goat'], ['rabbit', 'pig'],
    ['dragon', 'monkey'], ['dragon', 'rat'],
    ['snake', 'rooster'], ['snake', 'ox'],
    ['horse', 'dog'], ['horse', 'tiger'],
    ['goat', 'rabbit'], ['goat', 'pig'],
    ['monkey', 'rat'], ['monkey', 'dragon'],
    ['rooster', 'ox'], ['rooster', 'snake'],
    ['dog', 'tiger'], ['dog', 'horse'],
    ['pig', 'rabbit'], ['pig', 'goat'],
  ];

  const worstPairs: [ChineseAnimal, ChineseAnimal][] = [
    ['rat', 'horse'], ['ox', 'goat'],
    ['tiger', 'monkey'], ['rabbit', 'rooster'],
    ['dragon', 'dog'], ['snake', 'pig'],
  ];

  if (a1 === a2) return 70;
  if (bestPairs.some(([x, y]) => (x === a1 && y === a2) || (x === a2 && y === a1))) return 90;
  if (worstPairs.some(([x, y]) => (x === a1 && y === a2) || (x === a2 && y === a1))) return 35;

  return 60;
}

export { ZODIAC_DATA, CHINESE_ANIMALS };
