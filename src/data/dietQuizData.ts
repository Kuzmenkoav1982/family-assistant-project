export interface MealPlan {
  type: string;
  time: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  ingredients: string[];
  cooking_time_min: number;
  emoji: string;
}

export interface DayPlan {
  day: string;
  meals: MealPlan[];
}

export interface GeneratedPlan {
  daily_calories: number;
  daily_protein: number;
  daily_fats: number;
  daily_carbs: number;
  days: DayPlan[];
}

export interface QuizData {
  height_cm: string;
  current_weight_kg: string;
  target_weight_kg: string;
  age: string;
  gender: string;
  activity_level: string;
  smoking: boolean;
  alcohol_frequency: string;
  work_schedule: string;
  wake_time: string;
  sleep_time: string;
  medications: string[];
  chronic_diseases: string[];
  allergies: string[];
  disliked_foods: string[];
  diet_type: string;
  cuisine_preferences: string[];
  budget: string;
  cooking_complexity: string;
  cooking_time_max: string;
  gym_frequency: string;
  activity_type: string;
  target_timeframe: string;
  duration_days: string;
}

export interface MedTableHint {
  table: string;
  name: string;
  slug: string;
  forbidden: string[];
  principles: string[];
}

export const DIET_PLAN_API_URL = 'https://functions.poehali.dev/18a28f19-8a37-4b2f-8434-ed8b1365f97a';
export const MEAL_API = 'https://functions.poehali.dev/aabe67a3-cf0b-409f-8fa8-f3dac3c02223';
export const DIET_PROGRESS_API = 'https://functions.poehali.dev/41c5c664-7ded-4c89-8820-7af2dac89d54';
export const WALLET_API = 'https://functions.poehali.dev/26de1854-01bd-4700-bb2d-6e59cebab238';
export const AI_DIET_COST = 17;

export const DIET_PRICE_BY_DAYS: Record<number, number> = {
  7: 17,
  14: 29,
  30: 49,
};

export function calcDietPrice(days: number): number {
  if (DIET_PRICE_BY_DAYS[days] !== undefined) return DIET_PRICE_BY_DAYS[days];
  if (days <= 7) return 17;
  if (days <= 14) return 29;
  return 49;
}

export const initialData: QuizData = {
  height_cm: '', current_weight_kg: '', target_weight_kg: '', age: '',
  gender: '', activity_level: '', smoking: false, alcohol_frequency: '',
  work_schedule: '', wake_time: '07:00', sleep_time: '23:00',
  medications: [], chronic_diseases: [], allergies: [], disliked_foods: [],
  diet_type: '', cuisine_preferences: [], budget: '', cooking_complexity: '',
  cooking_time_max: '', gym_frequency: '', activity_type: '', target_timeframe: '',
  duration_days: '7',
};

export const steps = [
  { id: 'body', title: 'Тело', icon: 'User', description: 'Рост, вес, возраст' },
  { id: 'health', title: 'Здоровье', icon: 'HeartPulse', description: 'Болезни, аллергии, лекарства' },
  { id: 'lifestyle', title: 'Образ жизни', icon: 'Activity', description: 'Режим, активность, привычки' },
  { id: 'food', title: 'Предпочтения', icon: 'ChefHat', description: 'Кухня, бюджет, сложность' },
  { id: 'summary', title: 'Итого', icon: 'SquareCheck', description: 'Проверка и запуск' },
];

export const diseaseOptions = [
  'Гастрит', 'Язва желудка', 'Панкреатит', 'Холецистит',
  'Сахарный диабет 1 типа', 'Сахарный диабет 2 типа',
  'Гипертония', 'Подагра', 'Аллергия пищевая',
  'Заболевания почек', 'Заболевания печени', 'Целиакия',
];

export const allergyOptions = [
  'Глютен', 'Лактоза', 'Орехи', 'Арахис', 'Яйца',
  'Рыба', 'Морепродукты', 'Соя', 'Цитрусовые', 'Мёд',
];

export const cuisineOptions = [
  'Русская', 'Итальянская', 'Японская', 'Грузинская',
  'Средиземноморская', 'Азиатская', 'Мексиканская', 'Французская',
];

export const dislikedOptions = [
  'Лук', 'Чеснок', 'Грибы', 'Рыба', 'Морепродукты',
  'Субпродукты', 'Баклажаны', 'Брокколи', 'Творог', 'Каша',
];

export const diseaseMedTables: Record<string, MedTableHint> = {
  'Гастрит': { table: 'Стол №1', name: 'Лечебная диета при гастрите', slug: 'stol-1', forbidden: ['жареное', 'острое', 'копчёное', 'маринады', 'газировка', 'алкоголь', 'грибы', 'бобовые', 'кислые фрукты'], principles: ['Пища на пару или варёная', 'Дробное питание 5-6 раз', 'Температура блюд 15-65\u00B0C'] },
  'Язва желудка': { table: 'Стол №1', name: 'Лечебная диета при язве', slug: 'stol-1', forbidden: ['жареное', 'острое', 'копчёное', 'маринады', 'газировка', 'алкоголь', 'грибы', 'бобовые', 'кислые фрукты'], principles: ['Щадящее питание', 'Исключение грубой клетчатки', 'Дробное питание 5-6 раз'] },
  'Панкреатит': { table: 'Стол №5', name: 'Лечебная диета при панкреатите', slug: 'stol-5', forbidden: ['жирное мясо', 'сало', 'жареное', 'острое', 'копчёности', 'грибы', 'бобовые', 'шоколад', 'алкоголь'], principles: ['Ограничение жиров до 70-80 г/сутки', 'Дробное питание 5-6 раз', 'Пища в тёплом виде'] },
  'Холецистит': { table: 'Стол №5', name: 'Лечебная диета при холецистите', slug: 'stol-5', forbidden: ['жирное мясо', 'сало', 'субпродукты', 'жареное', 'острое', 'копчёности', 'грибы', 'шоколад', 'алкоголь'], principles: ['Варка, запекание, тушение', 'Дробное питание', 'Обильное питьё 1.5-2 л воды'] },
  'Заболевания печени': { table: 'Стол №5', name: 'Лечебная диета при болезнях печени', slug: 'stol-5', forbidden: ['жирное мясо', 'сало', 'субпродукты', 'жареное', 'острое', 'копчёности', 'грибы', 'алкоголь'], principles: ['Щадящая термообработка', 'Ограничение жиров', 'Дробное питание'] },
  'Сахарный диабет 1 типа': { table: 'Стол №9', name: 'Диета при диабете', slug: 'stol-9', forbidden: ['сахар', 'конфеты', 'шоколад', 'мёд', 'варенье', 'белый хлеб', 'сдоба', 'рис', 'манка', 'виноград', 'бананы'], principles: ['Контроль гликемического индекса', 'Равномерное распределение углеводов', 'Подсчёт хлебных единиц'] },
  'Сахарный диабет 2 типа': { table: 'Стол №9', name: 'Диета при диабете', slug: 'stol-9', forbidden: ['сахар', 'конфеты', 'шоколад', 'мёд', 'варенье', 'белый хлеб', 'сдоба', 'рис', 'манка', 'виноград', 'бананы'], principles: ['Контроль гликемического индекса', 'Дробное питание 5-6 раз', 'Замена сахара на сахарозаменители'] },
};

export const mealTypeNames: Record<string, string> = {
  breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин', snack: 'Перекус',
};