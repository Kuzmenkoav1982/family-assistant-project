import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import type { GoalCheckin, LifeGoal } from '@/components/life-road/types';
import { buildWeeklyView } from '@/lib/goals/weeklyReviewHelpers';
import { buildFocusQueue, type FocusItem } from '@/lib/goals/focusHelpers';
import FocusItemRow from './FocusItemRow';
import { pluralRu } from '@/lib/goals/weeklyReviewNarrative';
import { buildFocusToast } from './focusToasts';
import type { FocusActionContext, FocusActionKind } from './useFocusActions';

// Goals Focus / Execution V2 — Reason-aware Quick Actions.
//
// Верхняя секция Workshop: «что делать сейчас».
// Сама не делает запросов — берёт уже загруженные goals + checkinsByGoalId
// (тот же источник, что у WeeklyReviewSection).
//
// V2 поверх V1:
//   - reason-aware действия inline (без modal, без нового /focus):
//       stale/regressed → quick check-in
//       overdue         → reschedule / complete
//   - single-expand controller: один раскрытый item за раз
//   - после успеха зовём onChanged → Workshop делает reload(), очередь
//     перестраивается с новой причиной/позицией или строка уходит.

interface Props {
  goals: LifeGoal[];
  checkinsByGoalId: Record<string, GoalCheckin[]>;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Зовётся после любого успешного действия (Workshop делает reload). */
  onChanged?: () => void;
  /** Лимит видимых строк, остальные сворачиваются в подпись «+ ещё N». */
  limit?: number;
}

const DEFAULT_LIMIT = 6;

export default function FocusSection({
  goals,
  checkinsByGoalId,
  loading,
  error,
  onRetry,
  onChanged,
  limit = DEFAULT_LIMIT,
}: Props) {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const views = useMemo(
    () => buildWeeklyView({ goals, checkinsByGoalId }),
    [goals, checkinsByGoalId],
  );

  const queue: FocusItem[] = useMemo(
    () => buildFocusQueue({ views }),
    [views],
  );

  const visible = queue.slice(0, limit);
  const hiddenCount = Math.max(0, queue.length - visible.length);

  // Если раскрытая цель пропала из очереди (после успешного действия)
  // или больше нет в visible — схлопываем.
  useEffect(() => {
    if (!expandedId) return;
    const stillVisible = visible.some((i) => i.view.goal.id === expandedId);
    if (!stillVisible) setExpandedId(null);
  }, [visible, expandedId]);

  const goOpen = (id: string) => navigate(`/workshop/goal/${id}`);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleActionDone = () => {
    // После успешного действия закрываем раскрытый item, родитель reload'нёт
    // данные через onChanged → очередь пересчитается, эффект выше уберёт
    // строку (или оставит с другой причиной).
    setExpandedId(null);
  };

  // V2.1 polish: после успешного действия — короткий success toast.
  // Один тост на действие, текст детерминированный (см. focusToasts.ts).
  // Auto-hide / закрытие крестиком обеспечивает sonner (глобально в App.tsx).
  // Без undo: rollback-семантика для checkin/reschedule/complete сейчас вне scope.
  const handleChanged = (kind: FocusActionKind, ctx: FocusActionContext) => {
    const t = buildFocusToast(kind, ctx);
    if (kind === 'complete') {
      toast.success(t.title, { description: t.description, duration: 4000 });
    } else {
      toast(t.title, { description: t.description, duration: 3500 });
    }
    onChanged?.();
  };

  return (
    <section
      aria-label="Focus — что делать сейчас"
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <Icon name="Target" size={16} className="text-purple-700" />
          </span>
          <div>
            <div className="text-sm font-bold text-gray-900">Что делать сейчас</div>
            <div className="text-[10px] text-gray-500">
              Цели, которым нужно внимание
            </div>
          </div>
        </div>
        {!loading && !error && queue.length > 0 && (
          <span className="text-[10px] text-gray-500">
            {queue.length} {pluralRu(queue.length, 'цель', 'цели', 'целей')} в очереди
          </span>
        )}
      </div>

      <div className="min-h-[120px]" aria-live="polite" aria-busy={loading}>
        {loading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="flex items-start gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3"
          >
            <Icon name="AlertCircle" size={14} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold mb-0.5">Не удалось собрать Focus</div>
              <div className="text-rose-600">{error}</div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-1 text-rose-700 underline hover:no-underline"
                >
                  Повторить
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !error && goals.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-purple-200 rounded-xl">
            <Icon name="Target" size={24} className="mx-auto text-purple-300 mb-2" />
            <div className="text-sm font-semibold text-gray-700 mb-1">
              Пока нет целей — Focus появится, когда будут активные цели
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/life-road')}
              className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              Создать цель
            </Button>
          </div>
        )}

        {!loading && !error && goals.length > 0 && queue.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-4 flex items-start gap-2.5">
            <span className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Icon name="CheckCircle2" size={18} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900">
                Сегодня всё спокойно — срочных целей нет.
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Можно сосредоточиться на росте — обновить любую цель из списка ниже.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <ul className="space-y-1.5">
            {visible.map((item) => (
              <FocusItemRow
                key={item.view.goal.id}
                item={item}
                expanded={expandedId === item.view.goal.id}
                onOpen={() => goOpen(item.view.goal.id)}
                onToggleExpand={() => handleToggle(item.view.goal.id)}
                onActionDone={handleActionDone}
                onChanged={handleChanged}
              />
            ))}
            {hiddenCount > 0 && (
              <li className="text-[11px] text-gray-500 text-center pt-1">
                + ещё {hiddenCount}{' '}
                {pluralRu(hiddenCount, 'цель', 'цели', 'целей')} в очереди — см. в обзоре ниже
              </li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}