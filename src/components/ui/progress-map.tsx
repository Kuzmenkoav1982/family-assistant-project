import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export type ProgressStepStatus = 'done' | 'current' | 'available' | 'locked';

export interface ProgressStep {
  /** Уникальный id шага */
  id: string;
  /** Короткое название шага (отображается под кружком) */
  label: string;
  /** Подробный подзаголовок (опционально) — показывается мелким шрифтом */
  hint?: string;
  /** Иконка lucide-react */
  icon?: string;
  /** Статус шага */
  status: ProgressStepStatus;
  /** Текст-подсказка при наведении (например, «откроется после Сбора») */
  tooltip?: string;
  /** Прогресс заполнения шага (0-100), для визуального индикатора */
  progress?: number;
}

interface ProgressMapProps {
  steps: ProgressStep[];
  /** Колбэк клика по шагу. Получает step. Вызывается только для done/current/available. */
  onStepClick?: (step: ProgressStep) => void;
  /** Заголовок над картой */
  title?: string;
  /** Подзаголовок */
  subtitle?: string;
  /** Компактный режим (без описаний) */
  compact?: boolean;
  /** Цветовая схема акцента */
  accent?: 'violet' | 'emerald' | 'blue' | 'amber' | 'rose';
  className?: string;
}

const ACCENT_STYLES = {
  violet:  { bg: 'bg-violet-600',  ring: 'ring-violet-200',  text: 'text-violet-700',  line: 'bg-violet-500' },
  emerald: { bg: 'bg-emerald-600', ring: 'ring-emerald-200', text: 'text-emerald-700', line: 'bg-emerald-500' },
  blue:    { bg: 'bg-blue-600',    ring: 'ring-blue-200',    text: 'text-blue-700',    line: 'bg-blue-500' },
  amber:   { bg: 'bg-amber-600',   ring: 'ring-amber-200',   text: 'text-amber-700',   line: 'bg-amber-500' },
  rose:    { bg: 'bg-rose-600',    ring: 'ring-rose-200',    text: 'text-rose-700',    line: 'bg-rose-500' },
};

/**
 * ProgressMap — универсальная карта пошагового прогресса.
 *
 * Используется для:
 * — пошагового заполнения раздела (онбординг, мастер настройки),
 * — жизненных циклов семьи в админке,
 * — последовательных этапов в любом хабе.
 *
 * Пользователь видит сверху: где я сейчас, что заполнил, что впереди.
 * Заблокированные шаги показывают условие разблокировки в tooltip.
 */
export default function ProgressMap({
  steps,
  onStepClick,
  title,
  subtitle,
  compact = false,
  accent = 'violet',
  className,
}: ProgressMapProps) {
  const a = ACCENT_STYLES[accent];
  const doneCount = steps.filter((s) => s.status === 'done').length;
  const totalCount = steps.length;
  const overallPercent = Math.round((doneCount / totalCount) * 100);

  return (
    <div className={cn('w-full', className)}>
      {/* Шапка */}
      {(title || subtitle) && (
        <div className="flex items-end justify-between gap-2 mb-3 flex-wrap">
          <div>
            {title && <h3 className="text-sm font-bold text-slate-800 leading-tight">{title}</h3>}
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn('text-[10px] font-bold uppercase tracking-wider', a.text)}>
              Шаг {Math.min(doneCount + 1, totalCount)} из {totalCount}
            </span>
            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn('h-full transition-all duration-500', a.line)}
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Карта шагов — горизонтальный скролл при большом числе шагов */}
      <div className="relative">
        {/* Мягкие fade-края, чтобы было видно, что есть скролл */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white to-transparent z-10" />

        <div
          className="overflow-x-auto overflow-y-hidden -mx-1 px-1 progress-map-scroll"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div
            className="relative"
            style={{
              minWidth: `${steps.length * (compact ? 72 : 92)}px`,
            }}
          >
            {/* Базовая линия (фон) */}
            <div
              className="absolute left-0 right-0 h-0.5 bg-slate-200"
              style={{ top: compact ? 14 : 18 }}
            />
            {/* Линия прогресса (поверх базовой) */}
            <div
              className={cn('absolute left-0 h-0.5 transition-all duration-500', a.line)}
              style={{
                top: compact ? 14 : 18,
                width: `${(doneCount / Math.max(totalCount - 1, 1)) * 100}%`,
                maxWidth: '100%',
              }}
            />

            <div
              className="relative grid gap-1"
              style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
            >
              {steps.map((step) => (
                <ProgressStepNode
                  key={step.id}
                  step={step}
                  accent={accent}
                  compact={compact}
                  onClick={onStepClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProgressStepNodeProps {
  step: ProgressStep;
  accent: keyof typeof ACCENT_STYLES;
  compact: boolean;
  onClick?: (step: ProgressStep) => void;
}

function ProgressStepNode({ step, accent, compact, onClick }: ProgressStepNodeProps) {
  const a = ACCENT_STYLES[accent];
  const isClickable = !!onClick && step.status !== 'locked';
  const size = compact ? 'w-7 h-7' : 'w-9 h-9';
  const iconSize = compact ? 12 : 14;

  // Стили кружка по статусу
  const circleClass =
    step.status === 'done'
      ? cn(a.bg, 'text-white shadow-sm')
      : step.status === 'current'
      ? cn(a.bg, 'text-white shadow-md ring-4', a.ring, 'scale-110')
      : step.status === 'available'
      ? 'bg-white text-slate-500 border-2 border-slate-300 hover:border-slate-400'
      : 'bg-slate-100 text-slate-400 border-2 border-dashed border-slate-300';

  const labelClass =
    step.status === 'done'
      ? cn('font-semibold', a.text)
      : step.status === 'current'
      ? cn('font-bold', a.text)
      : step.status === 'available'
      ? 'font-medium text-slate-600'
      : 'text-slate-400';

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={isClickable ? () => onClick?.(step) : undefined}
      title={step.tooltip}
      className={cn(
        'group relative flex flex-col items-center gap-1.5 px-1 transition-all',
        isClickable ? 'cursor-pointer' : step.status === 'locked' ? 'cursor-not-allowed' : 'cursor-default'
      )}
    >
      {/* Кружок */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full transition-all',
          size,
          circleClass,
          isClickable && 'group-hover:shadow-lg'
        )}
      >
        {step.status === 'done' ? (
          <Icon name="Check" size={iconSize} />
        ) : step.status === 'locked' ? (
          <Icon name="Lock" size={iconSize - 2} />
        ) : step.icon ? (
          <Icon name={step.icon} size={iconSize} />
        ) : (
          <span className="text-[10px] font-bold">{/* пустой кружок для current/available */}</span>
        )}

        {/* Индикатор прогресса для current */}
        {step.status === 'current' && typeof step.progress === 'number' && step.progress > 0 && step.progress < 100 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-white/40 overflow-hidden">
            <div className={cn('h-full', a.line)} style={{ width: `${step.progress}%` }} />
          </div>
        )}
      </div>

      {/* Подпись */}
      {!compact && (
        <div className="flex flex-col items-center text-center min-w-0 w-full">
          <span className={cn('text-[10px] leading-tight truncate max-w-full', labelClass)}>
            {step.label}
          </span>
          {step.hint && step.status !== 'locked' && (
            <span className="text-[9px] text-slate-400 leading-tight truncate max-w-full mt-0.5">
              {step.hint}
            </span>
          )}
          {step.status === 'locked' && step.tooltip && (
            <span className="text-[9px] text-slate-400 leading-tight italic mt-0.5 line-clamp-2">
              {step.tooltip}
            </span>
          )}
        </div>
      )}
    </button>
  );
}