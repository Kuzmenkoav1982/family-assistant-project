import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { lifeApi } from '@/components/life-road/api';
import { BALANCE_SPHERES } from '@/components/life-road/frameworks';
import type { GoalCheckin, GoalKeyResult, LifeGoal } from '@/components/life-road/types';

// Check-in — это reflection, не progress source.
// НЕ меняет execution progress. НЕ подменяет metric/KR/scores.
// Сохраняет snapshot контекста "на момент записи" в data jsonb,
// чтобы история не перерисовывалась задним числом.

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  goal: LifeGoal;
  keyResults: GoalKeyResult[];
  onSaved?: (created: GoalCheckin) => void;
}

export default function GoalCheckinDialog({ open, onOpenChange, goal, keyResults, onSaved }: Props) {
  const [summary, setSummary] = useState('');
  const [blockers, setBlockers] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [selfAssessment, setSelfAssessment] = useState<number>(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSummary('');
    setBlockers('');
    setNextStep('');
    setSelfAssessment(5);
    setError(null);
  }, [open]);

  const buildSnapshot = (): Record<string, unknown> => {
    // Snapshot "состояние на момент записи" — чтобы история не плавала.
    if (goal.frameworkType === 'smart') {
      const fs = goal.frameworkState as {
        startValue?: number | null;
        currentValue?: number | null;
        targetValue?: number | null;
        unit?: string;
        metric?: string;
      };
      return {
        frameworkType: 'smart',
        metric: fs?.metric ?? null,
        unit: fs?.unit ?? null,
        startValue: fs?.startValue ?? null,
        currentValue: fs?.currentValue ?? null,
        targetValue: fs?.targetValue ?? null,
      };
    }
    if (goal.frameworkType === 'okr') {
      return {
        frameworkType: 'okr',
        keyResults: keyResults.map((k) => ({
          id: k.id,
          title: k.title,
          startValue: k.startValue,
          currentValue: k.currentValue,
          targetValue: k.targetValue,
          unit: k.unit,
          weight: k.weight,
          status: k.status,
        })),
      };
    }
    if (goal.frameworkType === 'wheel') {
      const fs = goal.frameworkState as {
        baselineScores?: Record<string, number | null>;
        currentScores?: Record<string, number | null>;
        targetScores?: Record<string, number | null>;
      };
      return {
        frameworkType: 'wheel',
        linkedSphereIds: goal.linkedSphereIds ?? [],
        baselineScores: fs?.baselineScores ?? {},
        currentScores: fs?.currentScores ?? {},
        targetScores: fs?.targetScores ?? {},
      };
    }
    return { frameworkType: 'generic' };
  };

  const handleSave = async () => {
    if (!summary.trim() && !blockers.trim() && !nextStep.trim()) {
      setError('Заполни хотя бы одно поле — что продвинулось, мешало или следующий шаг.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const today = new Date();
      const periodStart = new Date(today.getTime() - 7 * 86400000).toISOString().slice(0, 10);
      const periodEnd = today.toISOString().slice(0, 10);
      const created = await lifeApi.createCheckin({
        goalId: goal.id,
        summary: summary.trim() || null,
        blockers: blockers.trim() || null,
        nextStep: nextStep.trim() || null,
        selfAssessment,
        periodStart,
        periodEnd,
        data: { snapshot: buildSnapshot(), createdContextAt: new Date().toISOString() },
      });
      onSaved?.(created);
      onOpenChange(false);
    } catch (e) {
      setError((e as Error).message || 'Не удалось сохранить check-in');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[calc(100vw-1rem)] sm:w-auto max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name="CalendarHeart" size={22} />
            Check-in: «{goal.title}»
          </DialogTitle>
          <DialogDescription>
            Короткая сверка. Это рефлексия, она не меняет прогресс цели — сохраняется как запись.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Контекстный блок — снимок «на момент записи» */}
          <ContextBlock goal={goal} keyResults={keyResults} />

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Что продвинулось</Label>
            <Textarea
              rows={2}
              placeholder="Какие шаги сделал, что получилось..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Что мешало</Label>
            <Textarea
              rows={2}
              placeholder="Какие препятствия, отвлечения..."
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Следующий шаг</Label>
            <Textarea
              rows={2}
              placeholder="Один конкретный шаг на ближайшую неделю"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span>Самооценка недели: {selfAssessment}/10</span>
              <span className="text-[10px] text-gray-400 font-normal">субъективно, не влияет на прогресс</span>
            </Label>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={selfAssessment}
              onChange={(e) => setSelfAssessment(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>тяжело</span>
              <span>норм</span>
              <span>отлично</span>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Icon name={saving ? 'Loader2' : 'Check'} size={14} className={`mr-1.5 ${saving ? 'animate-spin' : ''}`} />
              Сохранить check-in
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContextBlock({ goal, keyResults }: { goal: LifeGoal; keyResults: GoalKeyResult[] }) {
  if (goal.frameworkType === 'smart') {
    const fs = goal.frameworkState as {
      metric?: string;
      unit?: string;
      currentValue?: number | null;
      targetValue?: number | null;
    };
    return (
      <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-2 text-[11px] text-blue-700">
        <div className="flex items-center gap-1.5 font-semibold mb-1">
          <Icon name="Gauge" size={11} /> Снимок SMART
        </div>
        <div>
          {fs?.metric || 'метрика'}: <b>{fs?.currentValue ?? '—'}</b> / {fs?.targetValue ?? '—'} {fs?.unit || ''}
        </div>
      </div>
    );
  }
  if (goal.frameworkType === 'okr') {
    return (
      <div className="rounded-xl bg-violet-50/60 border border-violet-100 p-2 text-[11px] text-violet-700">
        <div className="flex items-center gap-1.5 font-semibold mb-1">
          <Icon name="ListChecks" size={11} /> Снимок OKR — {keyResults.length} KR
        </div>
        <div className="space-y-0.5">
          {keyResults.slice(0, 4).map((k) => (
            <div key={k.id} className="truncate">
              • {k.title}: {k.currentValue}/{k.targetValue} {k.unit || ''}
            </div>
          ))}
          {keyResults.length > 4 && <div>и ещё {keyResults.length - 4}...</div>}
        </div>
      </div>
    );
  }
  if (goal.frameworkType === 'wheel') {
    const fs = goal.frameworkState as {
      baselineScores?: Record<string, number | null>;
      currentScores?: Record<string, number | null>;
      targetScores?: Record<string, number | null>;
    };
    const linked = goal.linkedSphereIds ?? [];
    return (
      <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-2 text-[11px] text-emerald-700">
        <div className="flex items-center gap-1.5 font-semibold mb-1">
          <Icon name="PieChart" size={11} /> Снимок Wheel
        </div>
        <div className="flex flex-wrap gap-1">
          {linked.map((sid) => {
            const sphere = BALANCE_SPHERES.find((s) => s.id === sid);
            const baseline = fs?.baselineScores?.[sid] ?? null;
            const current = fs?.currentScores?.[sid] ?? null;
            return (
              <Badge key={sid} variant="outline" className="text-[9px] border-emerald-300">
                {sphere?.label ?? sid}: {baseline ?? '—'} → {current ?? '—'}
              </Badge>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}
