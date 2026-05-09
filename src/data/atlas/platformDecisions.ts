// Журнал архитектурных решений по найденным конфликтам и пересечениям.
// Главный управленческий инструмент паспорта.
//
// Заполняется в Шаге 7 (после матрицы пересечений).

import type { OverlapCase } from './types';

export const OVERLAP_CASES: OverlapCase[] = [
  // Шаг 7: ~10-20 главных конфликтов. Шаблон:
  //
  // {
  //   id: 'overlap-portfolio-liferoad',
  //   sectionA: 'portfolio',
  //   sectionB: 'life-road',
  //   sharedEntity: 'цель',
  //   sharedFunction: 'карта развития',
  //   riskLevel: 'high',
  //   problem: 'Оба раздела позиционируются как карта развития человека',
  //   recommendation: 'Гипотеза триады: Портфолио = диагностика, Мастерская = осмысление',
  //   decision: 'needs-review',
  //   status: 'open',
  // },
  //
  // ЗАМЕТКА для Шага 7: первый кейс, который я уже знаю — отсутствие
  // единой админ-проверки на маршрутах /admin/*. Это не конфликт между
  // разделами, но риск безопасности; зафиксирую отдельно.
];

export function getCasesByStatus(status: OverlapCase['status']): OverlapCase[] {
  return OVERLAP_CASES.filter((c) => c.status === status);
}
