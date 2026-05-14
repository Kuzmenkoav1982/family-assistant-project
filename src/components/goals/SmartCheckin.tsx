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
  onCheckinSaved?: (checkinId?: string) => void;
}

export default function SmartCheckin({ goal, onSaved, onCheckinSaved }: Props) {
  const fs = (goal.frameworkState ?? {}) as Partial<SmartFrameworkState>;
  const currentInState = fs.currentValue ?? null;

  const [value, setValue] = useState<string>(
    currentInState !== null ? String(currentInState) : '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  // Краткая сводка последнего успешного замера: prev → next unit
  const [successSummary, setSuccessSummary] = useState<{
    prev: number | null;
    next: number;
    unit: string;
  } | null>(null);

  useEffect(() => {
    setValue(currentInState !== null ? String(currentInState) : '');
    setError(null);
    setSuccessSummary(null);
  }, [goal.id, currentInState]);

  if (goal.frameworkType !== 'smart') return null;

  const unit = fs.unit?.trim() || '';
  const metric = fs.metric?.trim() || 'метрика';
  const target = fs.targetValue ?? null;

  const handleSave = async () => {
    // Защита от повторного клика — пока идёт сохранение, новые вызовы игнорируем.
    if (saving) return;

    setError(null);
    setSuccessSummary(null);

    const trimmed = value.trim();
    if (trimmed === '') {
      setError('Укажи новое значение метрики');
      return;
    }
    // Поддерживаем запятую как разделитель.
    const normalized = trimmed.replace(',', '.');
    const numeric = Number(normalized);
    if (Number.isNaN(numeric) || !Number.isFinite(numeric)) {
      setError('Введи число в корректном формате (например, 3.5)');
      return;
    }
    if (currentInState !== null && numeric === currentInState) {
      setError('Новое значение должно отличаться от предыдущего');
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

      // Прогресс показываем сразу — UX не ждёт записи истории.
      onSaved?.(updated);

      // Snapshot в историю — best-effort. Только при успешном POST
      // дёргаем onCheckinSaved, чтобы лента check-ins перечитала список.
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
        .then((created) => {
          onCheckinSaved?.(created?.id);
        })
        .catch(() => {
          // История замеров — best-effort. Прогресс уже обновлён через updateGoal.
        });

      // Success-summary с краткой SMART-сводкой prev → next.
      setSuccessSummary({ prev: currentInState, next: numeric, unit });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
      setTimeout(() => setSuccessSummary(null), 4000);
    } catch (e) {
      // Понятный человеческий текст вместо сухого failed.
      const raw = (e as Error)?.message?.trim();
      const isNetwork = !raw || /network|failed to fetch|load failed/i.test(raw);
      setError(
        isNetwork
          ? 'Не удалось сохранить — проверь интернет и попробуй ещё раз'
          : `Не удалось сохранить замер. ${raw}`,
      );
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !saving) {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="например, 3.5"
            className="h-9 text-sm"
            disabled={saving}
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          aria-busy={saving}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70"
        >
          <Icon
            name={saving ? 'Loader2' : savedFlash ? 'Check' : 'Save'}
            size={14}
            className={`mr-1.5 ${saving ? 'animate-spin' : ''}`}
          />
          {saving ? 'Сохраняем…' : savedFlash ? 'Записано' : 'Записать'}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-1.5 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded p-1.5 mt-2">
          <Icon name="AlertCircle" size={12} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successSummary && !error && (
        <div className="flex items-start gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-1.5 mt-2">
          <Icon name="CheckCircle2" size={12} className="mt-0.5 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <div className="font-semibold">Запись добавлена</div>
            <div className="text-emerald-700">
              {metric}:{' '}
              {successSummary.prev !== null ? (
                <>
                  {successSummary.prev} <span className="text-emerald-500">→</span>{' '}
                  <b>{successSummary.next}</b>
                </>
              ) : (
                <b>{successSummary.next}</b>
              )}
              {successSummary.unit ? ` ${successSummary.unit}` : ''}
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-400 mt-2">
        Запись сразу обновит прогресс цели и сохранит точку в истории замеров.
      </p>
    </div>
  );
}