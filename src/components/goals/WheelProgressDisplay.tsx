import { useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import type { LifeGoal } from '@/components/life-road/types';
import { BALANCE_SPHERES } from '@/components/life-road/frameworks';
import { computeProgress } from '@/lib/goals/progress';
import {
  useAnimatedNumber,
  usePrefersReducedMotion,
  type ProgressFlash,
} from '@/components/goals/hooks/useProgressAnimations';

// Витрина прогресса Wheel-цели — без редактирования.
// Аналог Smart/Okr ProgressDisplay: tick-up числа, pulse-эффект на полосе и дельта-бейдж.
//
// Принципы:
//  - Источник истины — computeProgress (тот же, что и везде).
//  - Радар (SVG) + список сфер с цифрами — потому что один круг не читается без чисел.
//  - UI clamp 0..100, бейдж overshoot отдельно.

interface Props {
  goal: LifeGoal;
  variant?: 'compact' | 'full';
  flash?: ProgressFlash | null;
}

const WHEEL_MIN = 0;
const WHEEL_MAX = 10;

function clampScore(n: number): number {
  return Math.max(WHEEL_MIN, Math.min(WHEEL_MAX, n));
}

interface SphereView {
  id: string;
  label: string;
  icon: string;
  color: string;
  baseline: number | null;
  current: number | null;
  target: number | null;
  /** Прогресс сферы 0..100 (clamp). null если данных недостаточно. */
  pct: number | null;
  overshoot: boolean;
}

function buildSphereViews(goal: LifeGoal): SphereView[] {
  const linked = goal.linkedSphereIds || [];
  const s = (goal.frameworkState ?? {}) as {
    baselineScores?: Record<string, number | null>;
    currentScores?: Record<string, number | null>;
    targetScores?: Record<string, number | null>;
  };
  return linked
    .map((sid) => {
      const meta = BALANCE_SPHERES.find((b) => b.id === sid);
      if (!meta) return null;
      const baseline = (s.baselineScores?.[sid] ?? null) as number | null;
      const current = (s.currentScores?.[sid] ?? null) as number | null;
      const target = (s.targetScores?.[sid] ?? null) as number | null;
      let pct: number | null = null;
      let overshoot = false;
      if (baseline !== null && target !== null && current !== null) {
        const span = target - baseline;
        if (span > 0) {
          const ratio = (current - baseline) / span;
          if (ratio > 1) overshoot = true;
          pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
        }
      }
      return {
        id: sid,
        label: meta.label,
        icon: meta.icon,
        color: meta.color,
        baseline,
        current,
        target,
        pct,
        overshoot,
      } as SphereView;
    })
    .filter(Boolean) as SphereView[];
}

// Простой радар. Один полигон = текущее значение по сферам в виде доли от шкалы (0..10).
function WheelChart({ spheres, size = 220 }: { spheres: SphereView[]; size?: number }) {
  const center = size / 2;
  const radius = size / 2 - 22;
  const count = spheres.length;
  if (count < 3) return null; // радар для < 3 точек не читается

  const angleFor = (i: number) => (Math.PI * 2 * i) / count - Math.PI / 2;

  const pointFor = (i: number, value: number) => {
    const a = angleFor(i);
    const r = (clampScore(value) / WHEEL_MAX) * radius;
    return [center + Math.cos(a) * r, center + Math.sin(a) * r] as const;
  };

  // Концентрические круги-сетка
  const rings = [2, 4, 6, 8, 10];

  // Полигон текущих значений
  const currentPolygon = spheres
    .map((s, i) => {
      const v = s.current ?? 0;
      const [x, y] = pointFor(i, v);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Целевые значения — пунктиром
  const hasTargets = spheres.some((s) => s.target !== null);
  const targetPolygon = hasTargets
    ? spheres
        .map((s, i) => {
          const v = s.target ?? 0;
          const [x, y] = pointFor(i, v);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ')
    : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Колесо баланса"
      className="block"
    >
      {/* Сетка */}
      {rings.map((r) => (
        <circle
          key={r}
          cx={center}
          cy={center}
          r={(r / WHEEL_MAX) * radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}
      {/* Лучи */}
      {spheres.map((_, i) => {
        const a = angleFor(i);
        const x = center + Math.cos(a) * radius;
        const y = center + Math.sin(a) * radius;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        );
      })}
      {/* Target — пунктир */}
      {targetPolygon && (
        <polygon
          points={targetPolygon}
          fill="none"
          stroke="#0d9488"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          opacity={0.7}
        />
      )}
      {/* Current — заливка */}
      <polygon
        points={currentPolygon}
        fill="rgba(16, 185, 129, 0.25)"
        stroke="#10b981"
        strokeWidth={2}
      />
      {/* Точки по сферам с цветом сферы */}
      {spheres.map((s, i) => {
        const [x, y] = pointFor(i, s.current ?? 0);
        return <circle key={s.id} cx={x} cy={y} r={3.5} fill={s.color} />;
      })}
      {/* Подписи сфер по периметру */}
      {spheres.map((s, i) => {
        const a = angleFor(i);
        const lx = center + Math.cos(a) * (radius + 14);
        const ly = center + Math.sin(a) * (radius + 14);
        return (
          <text
            key={`l-${s.id}`}
            x={lx}
            y={ly}
            fontSize="9"
            fill="#475569"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}

export default function WheelProgressDisplay({ goal, variant = 'full', flash }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const breakdown = computeProgress(goal, [], []);
  const animatedExecution = useAnimatedNumber(breakdown.execution, reducedMotion);
  const spheres = useMemo(() => buildSphereViews(goal), [goal]);
  const flashActive = !!flash && flash.delta !== 0;
  const deltaText = flash ? `${flash.delta > 0 ? '+' : ''}${flash.delta}%` : '';

  if (goal.frameworkType !== 'wheel') return null;

  const measured = spheres.filter((s) => s.current !== null).length;
  const totalSpheres = spheres.length;
  const avg = (() => {
    const vals = spheres.map((s) => s.current).filter((v): v is number => typeof v === 'number');
    if (vals.length === 0) return null;
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round((sum / vals.length) * 10) / 10;
  })();

  if (variant === 'compact') {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-emerald-700 font-medium truncate">
            <Icon name="PieChart" size={11} />
            <span className="truncate">
              {totalSpheres} сфер{avg !== null ? ` · ср. ${avg}/10` : ''}
            </span>
          </span>
          <span
            className="font-bold text-emerald-700 flex items-center gap-1 whitespace-nowrap"
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
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
            style={{ width: `${animatedExecution}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="PieChart" size={14} className="text-emerald-700" />
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
          Колесо баланса · прогресс
        </span>
        {breakdown.overshoot && (
          <Badge variant="outline" className="text-[10px] border-violet-300 text-violet-700 ml-auto">
            <Icon name="Sparkles" size={10} className="mr-1" />
            перевыполнено
          </Badge>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
        {/* Радар слева */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          {totalSpheres >= 3 ? (
            <WheelChart spheres={spheres} />
          ) : (
            <div className="w-[180px] h-[180px] rounded-full bg-white border border-emerald-100 flex items-center justify-center text-[10px] text-gray-400 text-center px-3">
              Добавь 3+ сферы, чтобы появилось колесо
            </div>
          )}
        </div>

        {/* Сводка справа */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[11px] text-gray-500">средний уровень</div>
              <div className="text-xl font-extrabold text-gray-900 leading-tight tabular-nums">
                {avg !== null ? `${avg} / 10` : '—'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-gray-500">замерено сфер</div>
              <div className="text-xl font-extrabold text-gray-900 leading-tight tabular-nums">
                {measured} / {totalSpheres}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
              <span>общий прогресс</span>
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
              className="text-2xl font-extrabold text-emerald-700 leading-tight tabular-nums"
              aria-live="polite"
              aria-label={`Прогресс ${breakdown.execution} процентов`}
            >
              {animatedExecution}%
            </div>
            <div
              className={
                'mt-1 h-2 bg-white rounded-full overflow-hidden border transition-all duration-500 ' +
                (flashActive
                  ? reducedMotion
                    ? 'border-emerald-400 ring-1 ring-emerald-300'
                    : 'border-emerald-400 ring-2 ring-emerald-300/70 shadow-[0_0_12px_rgba(16,185,129,0.45)]'
                  : 'border-emerald-100')
              }
              role="progressbar"
              aria-valuenow={breakdown.execution}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={
                  'h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 ' +
                  (flashActive && !reducedMotion ? 'brightness-110' : '')
                }
                style={{ width: `${animatedExecution}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Список сфер — обязательное дублирование колеса цифрами */}
      {totalSpheres > 0 && (
        <div className="mt-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">
            Сферы
          </div>
          {spheres.map((s) => (
            <div key={s.id} className="space-y-0.5">
              <div className="flex items-center justify-between text-[11px] gap-2">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <Icon name={s.icon} fallback="Circle" size={12} className="text-gray-600 shrink-0" />
                  <span className="text-gray-800 truncate">{s.label}</span>
                </span>
                <span className="text-gray-600 tabular-nums shrink-0">
                  {s.current ?? '—'} / {s.target ?? '—'}
                  <span className="text-gray-400"> (старт {s.baseline ?? '—'})</span>
                </span>
              </div>
              {s.pct !== null && (
                <div
                  className="h-1 bg-white rounded-full overflow-hidden border border-emerald-100"
                  role="progressbar"
                  aria-valuenow={s.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${s.label}: ${s.pct}%`}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${s.pct}%`,
                      background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)`,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
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
