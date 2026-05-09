// Карта сущностей платформы.
// Здесь живут «вещи», которыми оперирует продукт: цели, планы, наблюдения,
// достижения, эмоции, события, правила, договорённости, AI-инсайты и т.д.
// Главная задача — для каждой сущности зафиксировать ОДИН home (где её «дом»).
//
// Заполняется в Шаге 5 (после смыслового прохода).

import type { PlatformEntity } from './types';

export const ENTITIES: PlatformEntity[] = [
  // Шаг 5: ~15-20 записей. Шаблон:
  //
  // {
  //   id: 'goal',
  //   name: 'Цель',
  //   description: 'Желаемый результат с измеримым критерием',
  //   homeSection: 'goals',
  //   createdIn: ['goals', 'life-road', 'portfolio', 'finance-goals'],
  //   editedIn: ['goals'],
  //   aggregatedIn: ['analytics'],
  //   shownIn: ['portfolio', 'life-road'],
  //   notes: 'КОНФЛИКТ: цель создаётся в 4 местах. Нужен home + витрины.',
  // },
];

export function getEntityById(id: string): PlatformEntity | undefined {
  return ENTITIES.find((e) => e.id === id);
}
