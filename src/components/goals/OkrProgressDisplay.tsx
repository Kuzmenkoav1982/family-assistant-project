import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import type { GoalKeyResult, LifeGoal } from '@/components/life-road/types';
import { computeProgress } from '@/lib/goals/progress';
import {
  useAnimatedNumber,
  usePrefersReducedMotion,
  type ProgressFlash,
} from '@/components/goals/hooks/useProgressAnimations';

// Витрина прогресса OKR-цели — без редактирования.
// Аналог SmartProgressDisplay: tick-up числа, pulse-эффект на полосе и дельта-бейдж.
//
// Принципы:
//  - Источник истины — computeProgress (тот же, что и везде).
//  - KR показываем кратко (top-N), полное редактирование живёт в OkrPanel.
//  - UI clamp 0..100, бейдж overshoot отдельно.

interface Props {
  goal: LifeGoal;
  keyResults: GoalKeyResult[];
  /** compact: одна строка для карточки списка. full: панель на странице цели. */
  variant?: 'compact' | 'full';
  /** Pulse-эффект и дельта после успешного check-in. */
  flash?: ProgressFlash | null;
  /** Сколько KR показывать в превью (full). По умолчанию 3. */
  topKrLimit?: number;
}

function clampPercent(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function krRatio(kr: GoalKeyResult): number {
  const span = kr.targetValue - kr.startValue;
  if (span === 0) return kr.status === 'done' ? 1 : 0;
  return (kr.currentValue - kr.startValue) / span;
}

export default function OkrProgressDisplay({
  goal,
  keyResults,
  variant = 'full',
  flash,
  topKrLimit = 3,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const breakdown = computeProgress(goal, [], keyResults);
  const animatedExecution = useAnimatedNumber(breakdown.execution, reducedMotion);
  const flashActive = !!flash && flash.delta !== 0;
  const deltaText = flash ? `${flash.delta > 0 ? '+' : ''}${flash.delta}%` : '';

  if (goal.frameworkType !== 'okr') return null;

  const objective = ((goal.frameworkState as { objective?: string })?.objective ?? '').trim();
  const totalKrs = keyResults.length;
  const doneKrs = keyResults.filter((k) => k.status === 'done').length;

  if (variant === 'compact') {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-violet-700 font-medium truncate min-w-0">
            <Icon name="Rocket" size={11} className="shrink-0" />
            <span className="truncate">{totalKrs} KR</span>
            {doneKrs > 0 && (
              <span className="text-gray-500">· {doneKrs} закрыто</span>
            )}
          </span>
          <span
            className="font-bold text-violet-700 flex items-center gap-1 whitespace-nowrap"
            aria-label={`Прогресс ${breakdown.execution} процентов`}
          >
            {animatedExecution}%
            {breakdown.overshoot && (
              <Icon name="Sparkles" size={10} className="text-violet-600" />
            )}
          </span>
        </div>
        <div
          className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={breakdown.execution}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
            style={{ width: `${animatedExecution}%` }}
          />
        </div>
        {breakdown.insufficientData && (
          <p className="text-[10px] text-amber-600">{breakdown.insufficientData}</p>
        )}
      </div>
    );
  }

  // Топ-3 KR — сортируем по убыванию доли прогресса, чтобы было видно «локомотивы».
  const topKrs = [...keyResults]
    .sort((a, b) => krRatio(b) - krRatio(a))
    .slice(0, topKrLimit);

  return (
    <div className="rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="Rocket" size={14} className="text-violet-700" />
        <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
          OKR · прогресс
        </span>
        {breakdown.overshoot && (
          <Badge variant="outline" className="text-[10px] border-violet-300 text-violet-700 ml-auto">
            <Icon name="Sparkles" size={10} className="mr-1" />
            перевыполнено
          </Badge>
        )}
      </div>

      {objective && (
        <div className="text-xs text-gray-700 mb-2 italic line-clamp-2">
          <span className="text-violet-600 font-semibold not-italic">Objective:</span> {objective}
        </div>
      )}

      <div className="flex items-end justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="text-[11px] text-gray-500 truncate">ключевые результаты</div>
          <div className="text-2xl font-extrabold text-gray-900 leading-tight">
            {doneKrs} / {totalKrs}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[11px] text-gray-500 flex items-center justify-end gap-1.5 whitespace-nowrap">
            <span>прогресс</span>
            {flashActive && (
              <span
                key={flash!.nonce}
                className={
                  'inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full border leading-none ' +
                  (flash!.delta > 0
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-rose-100 text-rose-700 border-rose-300') +
                  (reducedMotion ? '' : ' animate-in fade-in zoom-in-95 duration-300')
                }
              >
                {deltaText}
              </span>
            )}
          </div>
          <div
            className="text-2xl font-extrabold text-violet-700 leading-tight tabular-nums"
            aria-live="polite"
            aria-label={`Прогресс ${breakdown.execution} процентов`}
          >
            {animatedExecution}%
          </div>
        </div>
      </div>

      <div
        className={
          'h-2 bg-white rounded-full overflow-hidden border transition-all duration-500 ' +
          (flashActive
            ? reducedMotion
              ? 'border-violet-400 ring-1 ring-violet-300'
              : 'border-violet-400 ring-2 ring-violet-300/70 shadow-[0_0_12px_rgba(139,92,246,0.45)]'
            : 'border-violet-100')
        }
        role="progressbar"
        aria-valuenow={breakdown.execution}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={
            'h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700 ' +
            (flashActive && !reducedMotion ? 'brightness-110' : '')
          }
          style={{ width: `${animatedExecution}%` }}
        />
      </div>

      {topKrs.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wide text-violet-700 font-semibold">
            Ключевые результаты
          </div>
          {topKrs.map((kr) => {
            const pct = clampPercent(krRatio(kr) * 100);
            return (
              <div key={kr.id} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px] gap-2">
                  <span className="text-gray-700 truncate min-w-0 flex items-center gap-1">
                    {kr.status === 'done' && (
                      <Icon name="CheckCircle2" size={11} className="text-emerald-600 shrink-0" />
                    )}
                    <span className="truncate">{kr.title || 'без названия'}</span>
                  </span>
                  <span className="text-gray-600 tabular-nums shrink-0">
                    {kr.currentValue} / {kr.targetValue}
                    {kr.unit ? ` ${kr.unit}` : ''}
                  </span>
                </div>
                <div
                  className="h-1 bg-white rounded-full overflow-hidden border border-violet-100"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`KR ${kr.title}: ${pct}%`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {keyResults.length > topKrLimit && (
            <div className="text-[10px] text-gray-500 italic">
              и ещё {keyResults.length - topKrLimit}…
            </div>
          )}
        </div>
      )}

      {breakdown.insufficientData && (
        <p className="text-[11px] text-amber-700 bg-amber-50 rounded p-1.5 mt-2 flex items-start gap-1">
          <Icon name="TriangleAlert" size={11} className="mt-0.5 flex-shrink-0" />
          {breakdown.insufficientData}
        </p>
      )}
    </div>
  );
}
