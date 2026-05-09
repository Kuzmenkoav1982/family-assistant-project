// Ручной слой паспорта: смысл, замысел, классификация по roleType.
// Заполняется в Шаге 4 (большой смысловой проход) после инвентаризации.
// Ключ Map = section.id (совпадает с inventory).

import type { SemanticSection } from './types';

/**
 * Семантический паспорт раздела. Пока пустой — заполнится в Шаге 4.
 * Если для section.id здесь нет записи — атлас покажет «не классифицировано».
 */
export const SEMANTICS: Record<string, SemanticSection> = {
  // Шаг 4 (1 большой проход): тут появятся 70+ записей.
  // Шаблон записи:
  //
  // 'portfolio': {
  //   id: 'portfolio',
  //   status: 'ready',
  //   roleType: 'interpretation',
  //   audience: ['родитель', 'взрослый', 'ребёнок'],
  //   coreJob: 'Карта развития по 8 сферам с источниками и подсказками',
  //   purpose: 'Показать «где сейчас» и «что полезно сделать дальше»',
  //   pain: 'Родитель не видит цельной картины развития',
  //   expectedValue: 'Спокойствие и понимание следующего шага',
  //   evidenceLevel: 'hypothesis',
  //   coreEntities: ['наблюдение', 'оценка', 'план развития', 'достижение'],
  //   tools: ['радар по 8 сферам', 'источники данных', 'AI-подсказки', 'микропланы'],
  //   inputs: ['здоровье', 'привычки', 'достижения', 'ритуалы'],
  //   outputs: ['рекомендации', 'микропланы развития'],
  // },
};

export function getSemantic(id: string): SemanticSection | undefined {
  return SEMANTICS[id];
}

/** Сколько разделов уже классифицированы по roleType */
export function getSemanticCoverage(): { total: number; classified: number } {
  const classified = Object.values(SEMANTICS).filter((s) => s.roleType !== 'unknown').length;
  return { total: Object.keys(SEMANTICS).length, classified };
}
