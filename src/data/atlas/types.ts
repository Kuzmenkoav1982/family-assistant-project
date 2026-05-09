// Паспорт платформы — общие типы.
// Архитектурно слои разделены: inventory (auto), semantics (manual),
// connections (computed/manual), decisions (manual). Здесь — только типы.

/** Какую роль раздел играет в архитектуре платформы */
export type RoleType =
  | 'source' // ввод фактов, наблюдений, событий
  | 'interpretation' // агрегация и объяснение данных
  | 'action' // создание планов, задач, шагов
  | 'reflection' // осмысление, формирование смыслов
  | 'communication' // согласование, обсуждение
  | 'unknown'; // ещё не классифицирован

/** Уровень доказанности обещанной пользы */
export type EvidenceLevel =
  | 'hypothesis' // гипотеза, не подтверждено
  | 'usage-observed' // есть факт использования
  | 'pilot-confirmed' // подтверждено пилотом
  | 'stable'; // устойчивая регулярная польза

/** Статус раздела */
export type SectionStatus =
  | 'ready'
  | 'beta'
  | 'draft'
  | 'legacy'
  | 'duplicate-candidate'
  | 'unknown';

/** Тип связи между разделами */
export type ConnectionType =
  | 'feeds-from' // получает данные
  | 'sends-to' // отдаёт данные
  | 'overlaps-with' // смысловое пересечение
  | 'supports' // помогает работе другого раздела
  | 'alternative-to'; // потенциальный дубль

/** Тип архитектурного решения по конфликту */
export type DecisionType =
  | 'keep'
  | 'merge'
  | 'split'
  | 'rename'
  | 'move'
  | 'deprecate'
  | 'needs-review';

export interface PlatformConnection {
  type: ConnectionType;
  with: string; // section.id
  note?: string;
}

/** Авто-слой: то, что есть в коде (Sidebar/router) */
export interface InventorySection {
  id: string;
  hubId: string;
  label: string;
  icon: string;
  path: string;
  badge?: string;
  source: 'sidebar' | 'router' | 'hub-page' | 'manual';
}

export interface InventoryHub {
  id: string;
  title: string;
  icon: string;
  hubPath?: string;
}

/** Ручной слой: смысл, замысел, классификация */
export interface SemanticSection {
  id: string; // совпадает с InventorySection.id
  status: SectionStatus;
  roleType: RoleType;
  audience: string[]; // родитель | взрослый | ребёнок | пара | семья
  coreJob: string; // главная задача в одной фразе
  purpose: string; // замысел: зачем создан
  pain: string; // какую боль закрывает
  expectedValue: string; // обещанная польза
  evidenceLevel: EvidenceLevel;
  coreEntities: string[]; // с какими сущностями работает
  tools: string[]; // 3-7 ключевых инструментов
  inputs: string[]; // какие данные получает
  outputs: string[]; // что производит / куда влияет
  notes?: string;
}

/** Сущности платформы — где живут цели, планы, наблюдения и т.д. */
export interface PlatformEntity {
  id: string;
  name: string;
  description: string;
  homeSection?: string; // section.id — единственный «дом» этой сущности
  createdIn: string[]; // section.id[] — где создаётся
  editedIn: string[]; // section.id[] — где редактируется
  aggregatedIn: string[]; // section.id[] — где агрегируется
  shownIn: string[]; // section.id[] — где показывается как summary/витрина
  notes?: string;
}

/** Конфликт двух разделов — кейс для решения */
export interface OverlapCase {
  id: string;
  sectionA: string;
  sectionB: string;
  sharedEntity?: string;
  sharedFunction?: string;
  riskLevel: 'low' | 'medium' | 'high';
  problem: string;
  recommendation: string;
  decision?: DecisionType;
  status: 'open' | 'decided' | 'deferred';
  notes?: string;
}

/** Архитектурный принцип */
export interface PlatformPrinciple {
  id: string;
  title: string;
  body: string;
  status: 'hypothesis' | 'accepted' | 'rejected';
  appliesTo: string[]; // section.id[] | hub.id[] | 'all'
}
