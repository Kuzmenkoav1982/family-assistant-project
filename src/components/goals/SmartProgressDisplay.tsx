import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import type { LifeGoal } from '@/components/life-road/types';
import { computeProgress } from '@/lib/goals/progress';
import type { SmartFrameworkState } from '@/components/goals/forms/SmartForm';

// Витрина прогресса SMART-цели — без редактирования.
// Используется в LifeGoalsList (compact) и на странице цели (full).
//
// Принципы:
//  - Источник истины — computeProgress (тот же, что и везде).
//  - Не показывать срок в формуле прогресса (Правило 1 из progress.ts).
//  - Бейдж overshoot отдельно от полосы (UI clamp 0..100).

interface Props {
  goal: LifeGoal;
  /** compact: одна строка для карточки списка. full: панель приборов на странице цели. */
  variant?: 'compact' | 'full';
  /** Pulse-эффект и дельта после успешного check-in. nonce — чтобы повторять эффект. */
  flash?: { delta: number; from: number; to: number; nonce: number } | null;
}

// Хук — уважает системную настройку «уменьшать анимации».
// Используем для отказа от pulse у тех, кто этого попросил.
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export default function SmartProgressDisplay({ goal, variant = 'full', flash }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  if (goal.frameworkType !== 'smart') return null;

  const fs = (goal.frameworkState ?? {}) as Partial<SmartFrameworkState>;
  const breakdown = computeProgress(goal, [], []);
  // Pulse активен только в режиме 'full' и только при реальной дельте.
  const flashActive = !!flash && flash.delta !== 0;
  const deltaText = flash
    ? `${flash.delta > 0 ? '+' : ''}${flash.delta}%`
    : '';

  const current = fs.currentValue ?? null;
  const target = fs.targetValue ?? null;
  const unit = fs.unit?.trim() || '';
  const metric = fs.metric?.trim() || 'метрика';

  const valueLabel =
    current !== null && target !== null
      ? `${current} / ${target}${unit ? ` ${unit}` : ''}`
      : '—';

  if (variant === 'compact') {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-blue-700 font-medium truncate">
            <Icon name="Gauge" size={11} />
            <span className="truncate">{metric}</span>
            <span className="text-gray-700 font-semibold">{valueLabel}</span>
          </span>
          <span className="font-bold text-blue-700 flex items-center gap-1">
            {breakdown.execution}%
            {breakdown.overshoot && (
              <Icon name="Sparkles" size={10} className="text-violet-600" />
            )}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
            style={{ width: `${breakdown.execution}%` }}
          />
        </div>
        {breakdown.insufficientData && (
          <p className="text-[10px] text-amber-600">{breakdown.insufficientData}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="Gauge" size={14} className="text-blue-700" />
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
          Прогресс по метрике
        </span>
        {breakdown.overshoot && (
          <Badge variant="outline" className="text-[10px] border-violet-300 text-violet-700 ml-auto">
            <Icon name="Sparkles" size={10} className="mr-1" />
            перевыполнено
          </Badge>
        )}
      </div>

      <div className="flex items-end justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="text-[11px] text-gray-500 truncate">{metric}</div>
          <div className="text-2xl font-extrabold text-gray-900 leading-tight">
            {valueLabel}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[11px] text-gray-500 flex items-center justify-end gap-1.5">
            прогресс
            {flashActive && (
              <span
                key={flash!.nonce}
                className={
                  'inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full border ' +
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
          <div className="text-2xl font-extrabold text-blue-700 leading-tight">
            {breakdown.execution}%
          </div>
        </div>
      </div>

      <div
        className={
          'h-2 bg-white rounded-full overflow-hidden border transition-all duration-500 ' +
          (flashActive
            ? reducedMotion
              ? 'border-blue-400 ring-1 ring-blue-300'
              : 'border-blue-400 ring-2 ring-blue-300/70 shadow-[0_0_12px_rgba(59,130,246,0.45)]'
            : 'border-blue-100')
        }
      >
        <div
          className={
            'h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 ' +
            (flashActive && !reducedMotion ? 'brightness-110' : '')
          }
          style={{ width: `${breakdown.execution}%` }}
        />
      </div>

      {breakdown.insufficientData && (
        <p className="text-[11px] text-amber-700 bg-amber-50 rounded p-1.5 mt-2 flex items-start gap-1">
          <Icon name="TriangleAlert" size={11} className="mt-0.5 flex-shrink-0" />
          {breakdown.insufficientData}
        </p>
      )}
    </div>
  );
}