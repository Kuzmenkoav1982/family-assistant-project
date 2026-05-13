import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { lifeApi } from '@/components/life-road/api';
import type { LifeGoal } from '@/components/life-road/types';
import type { SmartFrameworkState } from '@/components/goals/forms/SmartForm';

// Быстрый замер метрики SMART-цели на сегодня.
// Что делает по нажатию "Записать":
//  1. PATCH frameworkState.currentValue → lifeApi.updateGoal()
//     (это поднимает execution progress через computeProgress)
//  2. POST в goal_checkins → lifeApi.createCheckin()
//     с snapshot-ом метрики (для истории) — это reflection, не source.
//
// Не путать с GoalCheckinDialog — там полноценная еженедельная сверка.
// Здесь — одно поле, один клик, для быстрого обновления текущего значения.

interface Props {
  goal: LifeGoal;
  onSaved?: (next: LifeGoal) => void;
}

export default function SmartCheckin({ goal, onSaved }: Props) {
  const fs = (goal.frameworkState ?? {}) as Partial<SmartFrameworkState>;
  const currentInState = fs.currentValue ?? null;

  const [value, setValue] = useState<string>(
    currentInState !== null ? String(currentInState) : '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setValue(currentInState !== null ? String(currentInState) : '');
    setError(null);
  }, [goal.id, currentInState]);

  if (goal.frameworkType !== 'smart') return null;

  const unit = fs.unit?.trim() || '';
  const metric = fs.metric?.trim() || 'метрика';
  const target = fs.targetValue ?? null;

  const handleSave = async () => {
    setError(null);

    if (value.trim() === '') {
      setError('Введи число замера');
      return;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      setError('Это должно быть число');
      return;
    }

    setSaving(true);
    try {
      const nextState: SmartFrameworkState = {
        specific: fs.specific ?? '',
        metric: fs.metric ?? '',
        startValue: fs.startValue ?? 0,
        currentValue: numeric,
        targetValue: fs.targetValue ?? null,
        unit: fs.unit ?? '',
        achievable: fs.achievable ?? '',
        relevant: fs.relevant ?? '',
        targetDate: fs.targetDate ?? '',
      };

      const updated = await lifeApi.updateGoal(goal.id, {
        frameworkState: nextState as unknown as Record<string, unknown>,
      });

      // Параллельно — snapshot в историю (best-effort, не блокируем UX при ошибке).
      lifeApi
        .createCheckin({
          goalId: goal.id,
          summary: `Замер: ${numeric}${unit ? ' ' + unit : ''}`,
          data: {
            kind: 'smart-metric-checkin',
            metric: fs.metric ?? null,
            unit: fs.unit ?? null,
            startValue: fs.startValue ?? null,
            previousValue: currentInState,
            currentValue: numeric,
            targetValue: fs.targetValue ?? null,
          },
        })
        .catch(() => {
          // История замеров — best-effort. Прогресс уже обновлён через updateGoal.
        });

      onSaved?.(updated);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (e) {
      setError((e as Error).message || 'Не удалось сохранить замер');
    } finally {
      setSaving(false);
    }
  };

  const hint =
    target !== null
      ? `Цель: ${target}${unit ? ' ' + unit : ''}`
      : 'Цель не задана — открой методику и заполни целевое значение';

  return (
    <div className="rounded-xl bg-white border border-blue-200 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="Plus" size={14} className="text-blue-700" />
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
          Замер на сегодня
        </span>
        <span className="text-[11px] text-gray-500 ml-auto truncate">{hint}</span>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0">
          <Label className="text-[10px] text-gray-500">
            {metric}
            {unit ? `, ${unit}` : ''}
          </Label>
          <Input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="например, 3.5"
            className="h-9 text-sm"
            disabled={saving}
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Icon
            name={saving ? 'Loader2' : savedFlash ? 'Check' : 'Save'}
            size={14}
            className={`mr-1.5 ${saving ? 'animate-spin' : ''}`}
          />
          {saving ? 'Сохраняю' : savedFlash ? 'Записано' : 'Записать'}
        </Button>
      </div>

      {error && (
        <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded p-1.5 mt-2">
          {error}
        </p>
      )}

      <p className="text-[10px] text-gray-400 mt-2">
        Запись сразу обновит прогресс цели и сохранит точку в истории замеров.
      </p>
    </div>
  );
}