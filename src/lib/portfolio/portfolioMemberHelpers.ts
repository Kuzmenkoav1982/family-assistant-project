// Portfolio Member detail (Sprint B) — read-only helpers.
//
// Чистые функции форматирования для верхней части `/portfolio/:memberId`:
//   - текст success/error toast после Refresh (повторно используем стандартный
//     `useToast()` из `@/hooks/use-toast`, у которого `TOAST_LIMIT = 1` —
//     отдельный single-toast хук строить не нужно).
//
// Никаких сторонних эффектов, никакой работы с sonner, никакого React.

export type PortfolioRefreshKind = 'success' | 'error';

export interface PortfolioRefreshToastInput {
  kind: PortfolioRefreshKind;
  /** Для error: сообщение от API (если есть). */
  errorMessage?: string | null;
  /** Имя участника — добавляется в description success-тоста, если есть. */
  memberName?: string | null;
}

export interface PortfolioRefreshToastPayload {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

/** kind + контекст → текст для одного toast. Полностью детерминированно. */
export function buildRefreshToast(
  input: PortfolioRefreshToastInput,
): PortfolioRefreshToastPayload {
  if (input.kind === 'success') {
    return {
      title: 'Портфолио обновлено',
      description: input.memberName
        ? `Свежий снимок данных для ${input.memberName}`
        : 'Свежий снимок данных собран',
      variant: 'default',
    };
  }
  // error
  const raw = (input.errorMessage ?? '').trim();
  return {
    title: 'Не удалось обновить',
    description: raw ? trimOneLine(raw, 140) : 'Попробуйте ещё раз через минуту',
    variant: 'destructive',
  };
}

/** Срезать в одну строку, заменить переносы пробелами, ограничить длину. */
export function trimOneLine(value: string, max = 140): string {
  const flat = value.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  return flat.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}
