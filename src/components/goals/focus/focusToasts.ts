// Goals Focus V2.1 — success toast polish.
//
// Чистый форматтер: kind + контекст → текст для одного success toast.
// Без undo, без error-toast (ошибки остаются inline в формах), без auto-open
// следующей строки. Один toast за раз гарантируется sonner-провайдером в App.tsx
// (там у Sonner стоит дефолтный toaster, который сам стэкует и таймаутит).
//
// Контракт текстов (в одну сторону, без рандомизации, чтобы было предсказуемо):
//   checkin     → «Замер сохранён»
//   reschedule  → «Срок перенесён на 14 мая 2026»
//   complete    → «Цель завершена ✨»
//
// Если по reschedule пришла плохая дата — fallback «Срок перенесён».

import type { FocusActionContext, FocusActionKind } from './useFocusActions';

const MONTHS_RU = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

/** Формат даты для toast: «14 мая 2026». Принимает 'YYYY-MM-DD'. */
export function formatRescheduleDate(iso: string | undefined | null): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map((p) => Number(p));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return `${d} ${MONTHS_RU[m - 1]} ${y}`;
}

export interface FocusToastPayload {
  /** Главный текст — всегда есть. */
  title: string;
  /** Подсказка под title — опциональная (для reschedule, например). */
  description?: string;
}

/** Чистая функция: kind + ctx → текст для toast. Не зовёт sonner. */
export function buildFocusToast(
  kind: FocusActionKind,
  ctx: FocusActionContext,
): FocusToastPayload {
  switch (kind) {
    case 'checkin':
      return {
        title: 'Замер сохранён',
        description: ctx.goalTitle ? `Цель «${ctx.goalTitle}»` : undefined,
      };
    case 'reschedule': {
      const human = formatRescheduleDate(ctx.newDeadline);
      return {
        title: human ? `Срок перенесён на ${human}` : 'Срок перенесён',
        description: ctx.goalTitle ? `Цель «${ctx.goalTitle}»` : undefined,
      };
    }
    case 'complete':
      return {
        title: 'Цель завершена ✨',
        description: ctx.goalTitle ? `«${ctx.goalTitle}» — больше не в Focus` : undefined,
      };
  }
}
