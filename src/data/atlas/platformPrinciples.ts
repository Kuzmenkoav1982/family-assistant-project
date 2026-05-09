// Архитектурные принципы платформы.
// Каждый принцип имеет статус: hypothesis | accepted | rejected.
// Гипотезы проверяются в шаге 6 (матрица пересечений) и принимаются/отвергаются.

import type { PlatformPrinciple } from './types';

export const PRINCIPLES: PlatformPrinciple[] = [
  {
    id: 'triad-diagnosis-reflection-execution',
    title: 'Триада: Диагностика → Осмысление → Исполнение',
    body:
      'Портфолио развития (interpretation) показывает «где сейчас» и «следующий шаг». ' +
      'Мастерская жизни (reflection) формирует смыслы, сезоны, длинные векторы. ' +
      'Планирование (action) превращает смыслы в задачи и календарь. ' +
      'Каждый из трёх разделов отвечает за свой уровень и не дублирует другие.',
    status: 'hypothesis',
    appliesTo: ['portfolio', 'life-road', 'goals', 'tasks', 'calendar', 'development'],
  },
  {
    id: 'one-home-per-entity',
    title: 'У каждой сущности — один дом',
    body:
      'Цели, планы, наблюдения, достижения и т.п. имеют ровно один раздел-владелец, ' +
      'где они создаются и редактируются. В остальных местах — только summary, ' +
      'deep-link или витрина. Это правило проверяется в карте сущностей (Шаг 5).',
    status: 'hypothesis',
    appliesTo: ['all'],
  },
  {
    id: 'one-role-per-section',
    title: 'У каждого раздела — ровно один roleType',
    body:
      'Раздел может быть source, interpretation, action, reflection или communication — ' +
      'но не одновременно. Если раздел хочет быть и тем, и другим, это сигнал, ' +
      'что его нужно разделить или явно сделать одну роль главной.',
    status: 'hypothesis',
    appliesTo: ['all'],
  },
  {
    id: 'honest-evidence',
    title: 'Честный уровень доказанности',
    body:
      'Если польза раздела пока — гипотеза, в паспорте честно стоит evidenceLevel = hypothesis. ' +
      'Уровень меняется только когда есть факт использования, пилот или устойчивая регулярность.',
    status: 'accepted',
    appliesTo: ['all'],
  },
  {
    id: 'admin-route-guard',
    title: 'Все /admin/* — под единой обёрткой AdminRoute',
    body:
      'Каждый admin-маршрут (кроме /admin/login) обёрнут в компонент AdminRoute, который ' +
      'проверяет localStorage.adminToken и редиректит на /admin/login без него. Бэкенд ' +
      'дополнительно проверяет X-Admin-Token на каждый запрос. Это закрывает «UI-косметику» ' +
      'и оставляет данные защищёнными даже при ручном вводе URL.',
    status: 'accepted',
    appliesTo: ['all'],
  },
];

export function getAcceptedPrinciples(): PlatformPrinciple[] {
  return PRINCIPLES.filter((p) => p.status === 'accepted');
}

export function getHypotheses(): PlatformPrinciple[] {
  return PRINCIPLES.filter((p) => p.status === 'hypothesis');
}