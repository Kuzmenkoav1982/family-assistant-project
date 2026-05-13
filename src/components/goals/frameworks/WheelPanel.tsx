import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { lifeApi } from '@/components/life-road/api';
import { BALANCE_SPHERES } from '@/components/life-road/frameworks';
import type { LifeGoal } from '@/components/life-road/types';
import { computeProgress } from '@/lib/goals/progress';
import { WHEEL_INITIAL, type WheelFrameworkState } from '@/components/goals/forms/WheelForm';

// Редактируемая WheelPanel.
// - baseline = точка отсчёта, READ-ONLY после создания цели (правило 2).
// - Редактируется только: currentScores, targetScores, steps.
// - Защита от деления на ноль и clamp 0..100 — внутри computeProgress.
// - Цель остаётся одной сущностью, не дробится на 8 целей.

interface Props {
  goal: LifeGoal;
  onSaved?: (next: LifeGoal) => void;
}

export default function WheelPanel({ goal, onSaved }: Props) {
  const [state, setState] = useState<WheelFrameworkState>({
    ...WHEEL_INITIAL,
    ...(goal.frameworkState as object),
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setState({ ...WHEEL_INITIAL, ...(goal.frameworkState as object) });
    setDirty(false);
    setError(null);
  }, [goal.id, goal.frameworkState]);

  const linked = goal.linkedSphereIds || [];

  const setScore = (
    kind: 'currentScores' | 'targetScores',
    sid: string,
    val: string,
  ) => {
    const num = val === '' ? null : Math.max(0, Math.min(10, Number(val)));
    setState((prev) => ({ ...prev, [kind]: { ...prev[kind], [sid]: num } }));
    setDirty(true);
  };

  const setStep = (sid: string, idx: number, text: string) => {
    setState((prev) => {
      const current = prev.steps[sid] || ['', '', ''];
      const next = [...current];
      next[idx] = text;
      return { ...prev, steps: { ...prev.steps, [sid]: next } };
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // baseline НЕ перезаписываем — он read-only в этой панели.
      const baseline = (goal.frameworkState as WheelFrameworkState)?.baselineScores || state.baselineScores;
      const updated = await lifeApi.updateGoal(goal.id, {
        frameworkState: {
          ...state,
          baselineScores: baseline, // защита: даже если state случайно изменился, кладём оригинал
        } as unknown as Record<string, unknown>,
      });
      setDirty(false);
      onSaved?.(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const preview = computeProgress({ ...goal, frameworkState: state as unknown as Record<string, unknown> }, [], []);

  if (linked.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic rounded-xl bg-white/70 border border-emerald-100 p-3">
        Сферы пока не привязаны. Открой редактор цели и выбери 1+ сферу Колеса.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-2 text-[11px] text-emerald-700 flex items-start gap-1.5">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0" />
        <span>
          Baseline = стартовая точка, она зафиксирована при создании цели и не меняется. Меняй
          «Сейчас» и при необходимости «Цель», добавляй микро-шаги.
        </span>
      </div>

      <div className="space-y-2">
        {linked.map((sid) => {
          const sphere = BALANCE_SPHERES.find((s) => s.id === sid);
          if (!sphere) return null;
          const baseline = state.baselineScores[sid];
          const current = state.currentScores[sid];
          const target = state.targetScores[sid];
          const steps = state.steps[sid] || ['', '', ''];
          const span = (target ?? 0) - (baseline ?? 0);
          const delta = (current ?? baseline ?? 0) - (baseline ?? 0);
          const sphereOver = span > 0 && delta > span;
          const sphereRatio = span > 0 ? Math.max(0, Math.min(1, delta / span)) : 0;

          return (
            <div key={sid} className="rounded-xl bg-white border border-emerald-100 p-2.5 space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-white"
                  style={{ background: sphere.color }}
                >
                  <Icon name={sphere.icon} size={13} />
                </div>
                <span className="text-xs font-semibold text-gray-800">{sphere.label}</span>
                {sphereOver && (
                  <Badge variant="outline" className="text-[9px] border-emerald-300 text-emerald-700 ml-auto">
                    перевыполнено
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {/* baseline READ-ONLY */}
                <div>
                  <Label className="text-[10px] text-gray-500">Старт (baseline)</Label>
                  <div className="h-7 px-2 flex items-center text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {baseline ?? '—'}
                    <Icon name="Lock" size={10} className="ml-auto text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] text-gray-500">Сейчас</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    className="h-7 text-xs border-emerald-300"
                    placeholder={baseline !== null && baseline !== undefined ? String(baseline) : '—'}
                    value={current ?? ''}
                    onChange={(e) => setScore('currentScores', sid, e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-gray-500">Цель</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    className="h-7 text-xs"
                    placeholder="—"
                    value={target ?? ''}
                    onChange={(e) => setScore('targetScores', sid, e.target.value)}
                  />
                </div>
              </div>

              {/* мини-прогресс по сфере */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${Math.round(sphereRatio * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold min-w-[36px] text-right">
                  {Math.round(sphereRatio * 100)}%
                </span>
              </div>

              <div>
                <Label className="text-[10px] text-gray-500">Микро-шаги</Label>
                <div className="space-y-1">
                  {[0, 1, 2].map((i) => (
                    <Textarea
                      key={i}
                      rows={1}
                      placeholder={`Шаг ${i + 1}`}
                      className="text-xs min-h-[28px] resize-none"
                      value={steps[i] || ''}
                      onChange={(e) => setStep(sid, i, e.target.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* общий прогресс */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase">Общий прогресс</div>
          <div className="text-xl font-extrabold text-emerald-700">{preview.execution}%</div>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            style={{ width: `${preview.execution}%` }}
          />
        </div>
        {preview.insufficientData && (
          <p className="text-[10px] text-amber-700 bg-amber-50 rounded p-1.5 mt-1.5 flex items-start gap-1">
            <Icon name="TriangleAlert" size={10} className="mt-0.5 flex-shrink-0" />
            {preview.insufficientData}
          </p>
        )}
      </div>

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
          <Icon name={saving ? 'Loader2' : 'Save'} size={12} className={`mr-1.5 ${saving ? 'animate-spin' : ''}`} />
          Сохранить
        </Button>
        {dirty && !saving && <span className="text-[10px] text-amber-700">Есть несохранённые изменения</span>}
        {!dirty && !saving && <span className="text-[10px] text-gray-400">Изменения сохранены</span>}
      </div>
    </div>
  );
}
