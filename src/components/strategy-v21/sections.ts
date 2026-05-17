// Единый источник правды по структуре /strategy v2.2.
// Используется и якорной навигацией, и режимом встречи (?mode=meeting).
// id ДОЛЖЕН совпадать с id секций в DOM (slide-1 ... slide-13).

export interface StrategySection {
  id: string;
  label: string;
  short: string;
}

export const STRATEGY_SECTIONS: StrategySection[] = [
  { id: 'slide-1', label: 'Наша Семья', short: 'Титул' },
  { id: 'slide-2', label: 'Почему именно сейчас', short: 'Сейчас' },
  { id: 'slide-3', label: 'Проблема', short: 'Проблема' },
  { id: 'slide-4', label: 'Семья как единый клиент — Семейный ID', short: 'Семейный ID' },
  { id: 'slide-5', label: 'Почему это важно банку', short: 'Ценность банку' },
  { id: 'slide-6', label: 'Что такое Наша Семья', short: 'Платформа' },
  { id: 'slide-7', label: 'Домовой', short: 'Домовой' },
  { id: 'slide-8', label: 'Готовность платформы', short: 'Готовность' },
  { id: 'slide-9', label: 'Путь к пилоту', short: 'Путь к пилоту' },
  { id: 'slide-10', label: 'Почему банку разумно контролировать', short: 'Контроль' },
  { id: 'slide-11', label: 'Форматы взаимодействия', short: 'Форматы' },
  { id: 'slide-12', label: 'Что получает банк', short: 'Что получает банк' },
  { id: 'slide-13', label: 'Следующий шаг', short: 'Следующий шаг' },
];
