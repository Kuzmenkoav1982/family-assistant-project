// Связи между разделами: feeds-from / sends-to / overlaps-with / supports / alternative-to.
// Часть связей попадёт сюда вручную, часть будет вычислена из ENTITIES (раздел в createdIn
// одной сущности и shownIn другой → автоматическая связь sends-to/feeds-from).
//
// Заполняется в Шаге 6 параллельно с матрицей пересечений.

import type { PlatformConnection } from './types';

export const CONNECTIONS: Record<string, PlatformConnection[]> = {
  // section.id -> список связей
  //
  // Шаг 6, шаблон:
  //
  // 'portfolio': [
  //   { type: 'feeds-from', with: 'health', note: 'данные о здоровье → сфера Тело' },
  //   { type: 'feeds-from', with: 'goals', note: 'активные цели влияют на подсказки' },
  //   { type: 'overlaps-with', with: 'life-road', note: 'оба ведут карту развития' },
  //   { type: 'sends-to', with: 'development', note: 'микропланы развития' },
  // ],
};

export function getConnections(sectionId: string): PlatformConnection[] {
  return CONNECTIONS[sectionId] ?? [];
}
