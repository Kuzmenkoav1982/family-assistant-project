import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LifeGoal } from '@/components/life-road/types';
import { useFocusActions, validateRescheduleDate } from './useFocusActions';

// Goals Focus V2 — действия для overdue целей.
//
// Жёстко по контракту: для overdue check-in не решает проблему дедлайна.
// Поэтому показываем только две reason-aware action:
//   1. Перенести срок — date-input + сохранить
//   2. Завершить цель — двухшаговое подтверждение + status='done'
// Fallback «Открыть цель» уже есть на самой строке (CTA).

interface Props {
  goal: LifeGoal;
  onDone: () => void;
  onCancel: () => void;
  onChanged: () => void;
}

const todayIso = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const plusDaysIso = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

type Mode = 'choose' | 'reschedule' | 'confirmComplete';

export default function FocusOverdueActions({
  goal,
  onDone,
  onCancel,
  onChanged,
}: Props) {
  const [mode, setMode] = useState<Mode>('choose');
  const [newDate, setNewDate] = useState<string>(plusDaysIso(7));
  const dateRef = useRef<HTMLInputElement | null>(null);

  const actions = useFocusActions({
    onChanged: () => onChanged(),
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !actions.busy) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel, actions.busy]);

  useEffect(() => {
    if (mode === 'reschedule') dateRef.current?.focus();
  }, [mode]);

  const dateError = mode === 'reschedule' ? validateRescheduleDate(newDate) : null;

  const handleReschedule = async () => {
    const updated = await actions.reschedule(goal, newDate);
    if (updated) onDone();
  };

  const handleComplete = async () => {
    const updated = await actions.completeGoal(goal);
    if (updated) onDone();
  };

  return (
    <div
      className="rounded-xl border border-rose-200 bg-rose-50/40 p-3 space-y-2"
      role="region"
      aria-label={`Действия по просроченной цели «${goal.title}»`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-rose-800">
        <Icon name="AlertTriangle" size={14} />
        Что сделать со сроком?
      </div>

      {mode === 'choose' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMode('reschedule')}
            className="justify-start"
          >
            <Icon name="CalendarClock" size={14} className="mr-1.5" />
            Перенести срок
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMode('confirmComplete')}
            className="justify-start text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          >
            <Icon name="CheckCircle2" size={14} className="mr-1.5" />
            Завершить цель
          </Button>
        </div>
      )}

      {mode === 'reschedule' && (
        <div className="space-y-2">
          <label className="text-[11px] text-gray-700">
            Новый срок (не раньше сегодня)
          </label>
          <Input
            ref={dateRef}
            type="date"
            value={newDate}
            min={todayIso()}
            onChange={(e) => setNewDate(e.target.value)}
            disabled={!!actions.busy}
            aria-invalid={!!dateError}
            className="bg-white"
          />
          {dateError && (
            <div className="text-[11px] text-amber-700">{dateError}</div>
          )}
          {actions.error && (
            <div role="alert" className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-2 py-1">
              {actions.error}
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMode('choose')}
              disabled={!!actions.busy}
            >
              Назад
            </Button>
            <Button
              size="sm"
              onClick={handleReschedule}
              disabled={!!dateError || !!actions.busy}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              {actions.busy === 'reschedule' ? (
                <>
                  <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
                  Сохраняю…
                </>
              ) : (
                <>
                  <Icon name="Check" size={12} className="mr-1" />
                  Перенести
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {mode === 'confirmComplete' && (
        <div className="space-y-2">
          <p className="text-[12px] text-gray-700">
            Отметить цель <b className="text-gray-900">«{goal.title}»</b> как достигнутую? Цель уйдёт из активных и из Focus.
          </p>
          {actions.error && (
            <div role="alert" className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-2 py-1">
              {actions.error}
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMode('choose')}
              disabled={!!actions.busy}
            >
              Назад
            </Button>
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={!!actions.busy}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {actions.busy === 'complete' ? (
                <>
                  <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
                  Завершаю…
                </>
              ) : (
                <>
                  <Icon name="CheckCircle2" size={12} className="mr-1" />
                  Да, завершить
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-0.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={!!actions.busy}
          className="text-[10px] text-gray-500 hover:text-gray-700 underline"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
