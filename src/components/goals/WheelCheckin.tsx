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
import { BALANCE_SPHERES } from '@/components/life-road/frameworks';
import type { LifeGoal } from '@/components/life-road/types';

// Быстрый замер Wheel: выбираешь сферу, вводишь новое значение 0..10, жмёшь «Записать».
// 1. PATCH frameworkState.currentScores[sphere] → lifeApi.updateGoal()
// 2. POST goal_checkins со snapshot-ом
//
// Симметрично SmartCheckin / OkrCheckin:
//  - валидация (пусто / не число / вне 0..10 / не отличается)
//  - guard от двойного клика
//  - success-summary prev → next
//  - aria-live / role="alert" / role="status" / aria-describedby
//  - фокус на input при ошибке
//  - запятая как разделитель, Enter сабмитит

const WHEEL_MIN = 0;
const WHEEL_MAX = 10;

interface Props {
  goal: LifeGoal;
  onSaved?: (next: LifeGoal) => void;
  onCheckinSaved?: (checkinId?: string) => void;
}

interface WheelState {
  baselineScores: Record<string, number | null>;
  currentScores: Record<string, number | null>;
  targetScores: Record<string, number | null>;
  steps?: Record<string, string[]>;
  notes?: string;
}

export default function WheelCheckin({ goal, onSaved, onCheckinSaved }: Props) {
  const linked = useMemo(() => goal.linkedSphereIds ?? [], [goal.linkedSphereIds]);

  const fs = (goal.frameworkState ?? {}) as Partial<WheelState>;
  const currentScores = fs.currentScores ?? {};
  const baselineScores = fs.baselineScores ?? {};
  const targetScores = fs.targetScores ?? {};

  const [selectedSphereId, setSelectedSphereId] = useState<string>(() => linked[0] ?? '');
  const [value, setValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [successSummary, setSuccessSummary] = useState<{
    label: string;
    prev: number | null;
    next: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = `wheel-checkin-error-${goal.id}`;
  const helpId = `wheel-checkin-help-${goal.id}`;

  const sphereMeta = BALANCE_SPHERES.find((b) => b.id === selectedSphereId);
  const currentInState =
    (currentScores[selectedSphereId] ?? null) as number | null;
  const targetForSphere =
    (targetScores[selectedSphereId] ?? null) as number | null;

  useEffect(() => {
    setValue(currentInState !== null ? String(currentInState) : '');
    setError(null);
    setSuccessSummary(null);
  }, [selectedSphereId, currentInState]);

  // Если связанных сфер нет вообще или выбранная пропала — переключаемся.
  useEffect(() => {
    if (!selectedSphereId || !linked.includes(selectedSphereId)) {
      setSelectedSphereId(linked[0] ?? '');
    }
  }, [linked, selectedSphereId]);

  if (goal.frameworkType !== 'wheel') return null;

  if (linked.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-emerald-200 p-3 shadow-sm text-xs text-gray-500 flex items-center gap-2">
        <Icon name="Info" size={13} className="text-emerald-600" />
        У цели ещё нет связанных сфер — добавь их в методике, чтобы делать замеры.
      </div>
    );
  }

  const hint =
    targetForSphere !== null
      ? `Цель: ${targetForSphere} / ${WHEEL_MAX}`
      : `Шкала: ${WHEEL_MIN}..${WHEEL_MAX}`;

  const handleSave = async () => {
    if (saving) return;
    setError(null);
    setSuccessSummary(null);

    const failValidation = (msg: string) => {
      setError(msg);
      requestAnimationFrame(() => inputRef.current?.focus());
    };
    if (!selectedSphereId || !sphereMeta) {
      failValidation('Выбери сферу');
      return;
    }
    const trimmed = value.trim();
    if (trimmed === '') {
      failValidation('Укажи новое значение для сферы');
      return;
    }
    const normalized = trimmed.replace(',', '.');
    const numeric = Number(normalized);
    if (Number.isNaN(numeric) || !Number.isFinite(numeric)) {
      failValidation('Введи число в корректном формате (например, 7)');
      return;
    }
    if (numeric < WHEEL_MIN || numeric > WHEEL_MAX) {
      failValidation(`Значение должно быть от ${WHEEL_MIN} до ${WHEEL_MAX}`);
      return;
    }
    if (currentInState !== null && numeric === currentInState) {
      failValidation('Новое значение должно отличаться от предыдущего');
      return;
    }

    setSaving(true);
    try {
      const nextState: WheelState = {
        baselineScores: { ...baselineScores },
        currentScores: { ...currentScores, [selectedSphereId]: numeric },
        targetScores: { ...targetScores },
        steps: fs.steps,
        notes: fs.notes,
      };

      const updated = await lifeApi.updateGoal(goal.id, {
        frameworkState: nextState as unknown as Record<string, unknown>,
      });
      onSaved?.(updated);

      const prev = currentInState;
      const sphereLabel = sphereMeta.label;
      lifeApi
        .createCheckin({
          goalId: goal.id,
          summary: `${sphereLabel}: ${prev ?? '—'} → ${numeric}`,
          data: {
            kind: 'wheel-sphere-checkin',
            sphereId: selectedSphereId,
            sphereLabel,
            baseline: baselineScores[selectedSphereId] ?? null,
            previousValue: prev,
            currentValue: numeric,
            targetValue: targetForSphere,
          },
        })
        .then((created) => onCheckinSaved?.(created?.id))
        .catch(() => {
          /* история — best-effort */
        });

      setSuccessSummary({ label: sphereLabel, prev, next: numeric });
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
    <div className="rounded-xl bg-white border border-emerald-200 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="Plus" size={14} className="text-emerald-700" />
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
          Замер сферы
        </span>
        <span className="text-[11px] text-gray-500 ml-auto truncate">{hint}</span>
      </div>

      <div className="space-y-2">
        <div>
          <Label className="text-[10px] text-gray-500">Сфера</Label>
          <Select
            value={selectedSphereId}
            onValueChange={(v) => setSelectedSphereId(v)}
            disabled={saving}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Выбери сферу" />
            </SelectTrigger>
            <SelectContent>
              {linked
                .map((sid) => BALANCE_SPHERES.find((b) => b.id === sid))
                .filter((s): s is (typeof BALANCE_SPHERES)[number] => !!s)
                .map((s) => {
                  const cur = currentScores[s.id] ?? null;
                  const tgt = targetScores[s.id] ?? null;
                  return (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label} ({cur ?? '—'} / {tgt ?? '—'})
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <Label className="text-[10px] text-gray-500">
              новое значение {WHEEL_MIN}..{WHEEL_MAX}
            </Label>
            <Input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              min={WHEEL_MIN}
              max={WHEEL_MAX}
              step={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !saving) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="например, 7"
              className="h-9 text-sm"
              disabled={saving}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : helpId}
              aria-label={`Новое значение для сферы ${sphereMeta?.label ?? ''}`}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !selectedSphereId}
            aria-busy={saving}
            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-70"
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
                {successSummary.label}:{' '}
                {successSummary.prev !== null ? (
                  <>
                    {successSummary.prev} <span className="text-emerald-500">→</span>{' '}
                    <b>{successSummary.next}</b>
                  </>
                ) : (
                  <b>{successSummary.next}</b>
                )}{' '}
                / {WHEEL_MAX}
              </div>
            </div>
          </div>
        )}
      </div>

      <p id={helpId} className="text-[10px] text-gray-400 mt-2">
        Замер обновит сферу и общий прогресс цели, а также сохранит точку в истории.
      </p>
    </div>
  );
}
