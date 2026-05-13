import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { lifeApi } from '@/components/life-road/api';
import type { LifeGoal } from '@/components/life-road/types';
import { computeProgress } from '@/lib/goals/progress';
import { SMART_INITIAL, type SmartFrameworkState } from '@/components/goals/forms/SmartForm';

// Редактируемая SmartPanel.
// - Источник истины: frameworkState (PUT всей структурой).
// - deadline = targetDate (синхронизируется при сохранении).
// - Прогресс считается отдельно от срока (правило 1).
// - Защита от деления на ноль и clamp 0..100 — внутри computeProgress.

interface Props {
  goal: LifeGoal;
  onSaved?: (next: LifeGoal) => void;
}

export default function SmartPanel({ goal, onSaved }: Props) {
  const [state, setState] = useState<SmartFrameworkState>({ ...SMART_INITIAL, ...(goal.frameworkState as object) });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setState({ ...SMART_INITIAL, ...(goal.frameworkState as object) });
    setDirty(false);
    setError(null);
  }, [goal.id, goal.frameworkState]);

  const set = <K extends keyof SmartFrameworkState>(k: K, v: SmartFrameworkState[K]) => {
    setState((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await lifeApi.updateGoal(goal.id, {
        frameworkState: state as unknown as Record<string, unknown>,
        // SMART: targetDate = deadline. Один источник.
        deadline: state.targetDate || null,
      });
      setDirty(false);
      onSaved?.(updated);
    } catch (e) {
      setError((e as Error).message || 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  // Локальный preview прогресса — берём из computeProgress, чтобы UI и реальный расчёт были одинаковыми
  const preview = computeProgress({ ...goal, frameworkState: state as unknown as Record<string, unknown> }, [], []);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <FieldBlock label="S — Конкретно" required>
          <Textarea
            rows={3}
            value={state.specific}
            onChange={(e) => set('specific', e.target.value)}
            placeholder="Что именно достигаю"
            className="text-xs"
          />
        </FieldBlock>
        <FieldBlock label="M — Метрика" required>
          <Input
            value={state.metric}
            onChange={(e) => set('metric', e.target.value)}
            placeholder="distance, кг..."
            className="text-xs h-8 mb-1"
          />
          <Input
            value={state.unit}
            onChange={(e) => set('unit', e.target.value)}
            placeholder="ед. изм."
            className="text-xs h-7"
          />
        </FieldBlock>
        <FieldBlock label="A — Достижимо">
          <Textarea
            rows={3}
            value={state.achievable}
            onChange={(e) => set('achievable', e.target.value)}
            className="text-xs"
          />
        </FieldBlock>
        <FieldBlock label="R — Релевантно">
          <Textarea
            rows={3}
            value={state.relevant}
            onChange={(e) => set('relevant', e.target.value)}
            className="text-xs"
          />
        </FieldBlock>
        <FieldBlock label="T — Срок" required>
          <Input
            type="date"
            value={state.targetDate}
            onChange={(e) => set('targetDate', e.target.value)}
            className="text-xs h-8"
          />
          <p className="text-[9px] text-gray-400 mt-1">
            Срок — отдельный канал, не входит в формулу прогресса
          </p>
        </FieldBlock>
      </div>

      {/* Метрика — отдельный редактор с текущим значением */}
      <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Gauge" size={12} className="text-blue-700" />
          <span className="text-[11px] font-semibold text-blue-700 uppercase">Замер метрики</span>
          {preview.overshoot && (
            <Badge variant="outline" className="text-[9px] border-violet-300 text-violet-700 ml-auto">
              перевыполнено
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumberField
            label="Старт"
            value={state.startValue}
            onChange={(v) => set('startValue', v)}
            placeholder="0"
          />
          <NumberField
            label="Сейчас"
            value={state.currentValue}
            onChange={(v) => set('currentValue', v)}
            placeholder="—"
            highlight
          />
          <NumberField
            label="Цель"
            value={state.targetValue}
            onChange={(v) => set('targetValue', v)}
            placeholder="—"
          />
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <span>Прогресс по метрике:</span>
          <span className="font-bold text-blue-700">{preview.execution}%</span>
          {state.unit && (
            <span className="text-gray-400">({state.currentValue ?? '—'}/{state.targetValue ?? '—'} {state.unit})</span>
          )}
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

function FieldBlock({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white border border-blue-100 p-2">
      <Label className="text-[10px] font-semibold text-blue-700 mb-1 block">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
  highlight,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <Label className="text-[10px] text-gray-500">{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        className={`h-7 text-xs ${highlight ? 'border-blue-400' : ''}`}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      />
    </div>
  );
}
