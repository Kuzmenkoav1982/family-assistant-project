// Источник правды по /strategy/appendix (закрытый резерв).
// 8 секций А1–А8 — внутренний контур ответов на уточняющие вопросы.

export interface AppendixSection {
  id: string;
  code: string;
  label: string;
  short: string;
}

export const APPENDIX_SECTIONS: AppendixSection[] = [
  { id: 'apx-1', code: 'А1', label: 'Архитектурный контур платформы', short: 'Архитектура' },
  { id: 'apx-2', code: 'А2', label: 'Семейная модель данных и доступ', short: 'Данные' },
  { id: 'apx-3', code: 'А3', label: 'Безопасность и границы контура', short: 'Безопасность' },
  { id: 'apx-4', code: 'А4', label: 'Форматы взаимодействия с банком', short: 'Форматы' },
  { id: 'apx-5', code: 'А5', label: 'Состав глубокого актива', short: 'Актив' },
  { id: 'apx-6', code: 'А6', label: 'Команда и контур исполнения', short: 'Команда' },
  { id: 'apx-7', code: 'А7', label: 'Контур пилота', short: 'Пилот' },
  { id: 'apx-8', code: 'А8', label: 'Показатели и критерии результата', short: 'Показатели' },
];
