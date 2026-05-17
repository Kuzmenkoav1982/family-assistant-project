// Единый источник правды по /strategy/proof.
// Доказательная продуктовая презентация v1.0 — 9 экранов (Д1–Д9).
// id совпадает с id секций в DOM.

export interface ProofSection {
  id: string;
  label: string;
  short: string;
}

export const PROOF_SECTIONS: ProofSection[] = [
  { id: 'proof-1', label: 'Карта платформы', short: 'Карта' },
  { id: 'proof-2', label: 'Сквозные семейные маршруты', short: 'Маршруты' },
  { id: 'proof-3', label: 'Домовой — оркестратор семейного контекста', short: 'Домовой' },
  { id: 'proof-4', label: 'Где здесь банк', short: 'Банк' },
  { id: 'proof-5', label: 'Что уже собрано', short: 'Готовность' },
  { id: 'proof-6', label: 'Семейная модель данных', short: 'Данные' },
  { id: 'proof-7', label: 'Поэтапное встраивание в контур банка', short: 'Интеграция' },
  { id: 'proof-8', label: 'Состав глубокого актива', short: 'Актив' },
  { id: 'proof-9', label: 'Готовность к разговору о формате', short: 'Формат' },
];
