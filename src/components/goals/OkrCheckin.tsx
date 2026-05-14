import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { lifeApi } from '@/components/life-road/api';
import type { GoalKeyResult, LifeGoal } from '@/components/life-road/types';

// Быстрый замер OKR: выбираешь Key Result, вводишь новое значение, жмёшь "Записать".
// 1. PUT key_result.currentValue → backend пересчитывает кэш execution
// 2. POST goal_checkins со snapshot-ом для истории
//
// Симметрично SmartCheckin — те же polish-правила:
//  - валидация (пусто / не число / не отличается)
//  - guard от двойного клика
//  - success-summary prev → next
//  - aria-live / role="alert" / role="status" / aria-describedby
//  - фокус на input при ошибке
//  - поддержка запятой как разделителя
//  - Enter сабмитит форму

interface Props {
  goal: LifeGoal;
  keyResults: GoalKeyResult[];
  /** После успешного PUT KR — отдаём свежую цель родителю (для прогресса). */
  onGoalRefreshed?: (next: LifeGoal) => void;
  /** После успешного POST check-in — пробрасываем id для подсветки строки. */
  onCheckinSaved?: (checkinId?: string) => void;
}

export default function OkrCheckin({
  goal,
  keyResults,
  onGoalRefreshed,
  onCheckinSaved,
}: Props) {
  // Только активные KR в списке выбора.
  const activeKrs = useMemo(
    () => keyResults.filter((k) => k.status !== 'done'),
    [keyResults],
  );

  const [selectedKrId, setSelectedKrId] = useState<string>(() => activeKrs[0]?.id ?? '');
  const selectedKr = useMemo(
    () => keyResults.find((k) => k.id === selectedKrId) ?? null,
    [keyResults, selectedKrId],
  );

  const [value, setValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [successSummary, setSuccessSummary] = useState<{
    title: string;
    prev: number;
    next: number;
    unit: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = `okr-checkin-error-${goal.id}`;
  const helpId = `okr-checkin-help-${goal.id}`;

  // При смене выбранного KR — подставляем его текущее значение в input.
  useEffect(() => {
    if (selectedKr) setValue(String(selectedKr.currentValue));
    setError(null);
    setSuccessSummary(null);
  }, [selectedKrId, selectedKr?.currentValue, selectedKr]);

  // Если активного выбранного KR больше нет (был удалён/закрыт) — переключаемся.
  useEffect(() => {
    if (!selectedKrId || !keyResults.find((k) => k.id === selectedKrId)) {
      setSelectedKrId(activeKrs[0]?.id ?? '');
    }
  }, [keyResults, activeKrs, selectedKrId]);

  if (goal.frameworkType !== 'okr') return null;
  if (activeKrs.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-violet-200 p-3 shadow-sm text-xs text-gray-500 flex items-center gap-2">
        <Icon name="Info" size={13} className="text-violet-600" />
        Нет активных Key Results — добавь хотя бы один в методике, чтобы делать замеры.
      </div>
    );
  }

  const krUnit = (selectedKr?.unit ?? '').trim();
  const krTarget = selectedKr?.targetValue ?? null;
  const hint = krTarget !== null ? `Цель: ${krTarget}${krUnit ? ' ' + krUnit : ''}` : '—';

  const handleSave = async () => {
    if (saving) return;
    if (!selectedKr) return;

    setError(null);
    setSuccessSummary(null);

    const trimmed = value.trim();
    const failValidation = (msg: string) => {
      setError(msg);
      requestAnimationFrame(() => inputRef.current?.focus());
    };
    if (trimmed === '') {
      failValidation('Укажи новое значение KR');
      return;
    }
    const normalized = trimmed.replace(',', '.');
    const numeric = Number(normalized);
    if (Number.isNaN(numeric) || !Number.isFinite(numeric)) {
      failValidation('Введи число в корректном формате (например, 3.5)');
      return;
    }
    if (numeric === selectedKr.currentValue) {
      failValidation('Новое значение должно отличаться от предыдущего');
      return;
    }

    setSaving(true);
    try {
      // 1. PUT KR — обновляем currentValue, backend сам пересчитывает execution.
      await lifeApi.updateKeyResult(selectedKr.id, { currentValue: numeric });

      // 2. Перечитываем цель, чтобы родитель получил свежий executionProgress.
      const allGoals = await lifeApi.listGoals();
      const fresh = allGoals.find((g) => g.id === goal.id);
      if (fresh) onGoalRefreshed?.(fresh);

      // 3. Snapshot в историю — best-effort.
      lifeApi
        .createCheckin({
          goalId: goal.id,
          summary: `Замер KR «${selectedKr.title || 'без названия'}»: ${numeric}${krUnit ? ' ' + krUnit : ''}`,
          data: {
            kind: 'okr-kr-checkin',
            keyResultId: selectedKr.id,
            keyResultTitle: selectedKr.title,
            unit: krUnit || null,
            startValue: selectedKr.startValue,
            previousValue: selectedKr.currentValue,
            currentValue: numeric,
            targetValue: selectedKr.targetValue,
          },
        })
        .then((created) => onCheckinSaved?.(created?.id))
        .catch(() => {
          /* история — best-effort, прогресс уже обновлён */
        });

      setSuccessSummary({
        title: selectedKr.title || 'KR',
        prev: selectedKr.currentValue,
        next: numeric,
        unit: krUnit,
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
      setTimeout(() => setSuccessSummary(null), 4000);
    } catch (e) {
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

  return (
    <div className="rounded-xl bg-white border border-violet-200 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="Plus" size={14} className="text-violet-700" />
        <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
          Замер KR на сегодня
        </span>
        <span className="text-[11px] text-gray-500 ml-auto truncate">{hint}</span>
      </div>

      <div className="space-y-2">
        <div>
          <Label className="text-[10px] text-gray-500">Key Result</Label>
          <Select
            value={selectedKrId}
            onValueChange={(v) => setSelectedKrId(v)}
            disabled={saving}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Выбери KR" />
            </SelectTrigger>
            <SelectContent>
              {activeKrs.map((kr) => (
                <SelectItem key={kr.id} value={kr.id}>
                  {kr.title || 'без названия'} ({kr.currentValue} / {kr.targetValue}
                  {kr.unit ? ` ${kr.unit}` : ''})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <Label className="text-[10px] text-gray-500">
              новое значение{krUnit ? `, ${krUnit}` : ''}
            </Label>
            <Input
              ref={inputRef}
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
              aria-invalid={!!error}
              aria-describedby={error ? errorId : helpId}
              aria-label={`Новое значение KR ${selectedKr?.title ?? ''}`}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !selectedKr}
            aria-busy={saving}
            className="h-9 bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-70"
          >
            <Icon
              name={saving ? 'Loader2' : savedFlash ? 'Check' : 'Save'}
              size={14}
              className={`mr-1.5 ${saving ? 'animate-spin' : ''}`}
            />
            {saving ? 'Сохраняем…' : savedFlash ? 'Записано' : 'Записать'}
          </Button>
        </div>
      </div>

      <div className="min-h-[52px] mt-2" aria-live="polite" aria-atomic="true">
        {error && (
          <div
            id={errorId}
            role="alert"
            className="flex items-start gap-1.5 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded p-1.5"
          >
            <Icon name="AlertCircle" size={12} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successSummary && !error && (
          <div
            role="status"
            className="flex items-start gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-1.5"
          >
            <Icon name="CheckCircle2" size={12} className="mt-0.5 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <div className="font-semibold">Запись добавлена</div>
              <div className="text-emerald-700">
                {successSummary.title}: {successSummary.prev}{' '}
                <span className="text-emerald-500">→</span>{' '}
                <b>{successSummary.next}</b>
                {successSummary.unit ? ` ${successSummary.unit}` : ''}
              </div>
            </div>
          </div>
        )}
      </div>

      <p id={helpId} className="text-[10px] text-gray-400 mt-2">
        Запись обновит KR и общий прогресс цели, а также сохранит точку в истории замеров.
      </p>
    </div>
  );
}
