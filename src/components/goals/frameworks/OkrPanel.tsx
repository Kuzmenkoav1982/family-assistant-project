import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { lifeApi } from '@/components/life-road/api';
import type { GoalKeyResult, LifeGoal } from '@/components/life-road/types';
import { computeProgress } from '@/lib/goals/progress';

// Редактируемая OkrPanel.
// - Objective хранится в frameworkState.
// - KR хранятся в отдельной таблице (источник истины).
// - Вес нормализуется при расчёте (0/null → 1).
// - Общий прогресс clamp 0..100, overshoot — отдельный флаг.

interface Props {
  goal: LifeGoal;
  keyResults: GoalKeyResult[];
  onChanged?: () => Promise<void> | void;
}

export default function OkrPanel({ goal, keyResults, onChanged }: Props) {
  const [objective, setObjective] = useState<string>(
    ((goal.frameworkState as { objective?: string })?.objective) || '',
  );
  const [objDirty, setObjDirty] = useState(false);
  const [savingObj, setSavingObj] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [krs, setKrs] = useState<GoalKeyResult[]>(keyResults);

  useEffect(() => setKrs(keyResults), [keyResults]);
  useEffect(() => {
    setObjective(((goal.frameworkState as { objective?: string })?.objective) || '');
    setObjDirty(false);
  }, [goal.id, goal.frameworkState]);

  const saveObjective = async () => {
    setSavingObj(true);
    setError(null);
    try {
      await lifeApi.updateGoal(goal.id, {
        frameworkState: { ...(goal.frameworkState as object), objective },
      });
      setObjDirty(false);
      await onChanged?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingObj(false);
    }
  };

  const addKr = async () => {
    if (krs.length >= 5) return;
    try {
      const created = await lifeApi.createKeyResult({
        goalId: goal.id,
        title: 'Новый KR',
        metricType: 'number',
        startValue: 0,
        currentValue: 0,
        targetValue: 100,
        unit: '',
        weight: 1,
        order: krs.length,
      });
      setKrs([...krs, created]);
      await onChanged?.();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const updateKr = async (id: string, patch: Partial<GoalKeyResult>) => {
    // Оптимистично обновляем локально, далее PUT
    setKrs((prev) => prev.map((k) => (k.id === id ? { ...k, ...patch } : k)));
    try {
      await lifeApi.updateKeyResult(id, patch);
      await onChanged?.();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const removeKr = async (id: string) => {
    if (!confirm('Удалить ключевой результат?')) return;
    try {
      await lifeApi.deleteKeyResult(id);
      setKrs((prev) => prev.filter((k) => k.id !== id));
      await onChanged?.();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const preview = computeProgress(goal, [], krs);
  const totalWeight = krs.reduce((s, k) => s + (k.weight && k.weight > 0 ? k.weight : 1), 0);

  return (
    <div className="space-y-3">
      {/* Objective */}
      <div className="rounded-xl bg-white border border-violet-100 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon name="Rocket" size={14} className="text-violet-700" />
          <Label className="text-xs font-semibold text-violet-700">Objective</Label>
        </div>
        <Textarea
          rows={2}
          value={objective}
          onChange={(e) => {
            setObjective(e.target.value);
            setObjDirty(true);
          }}
          className="text-sm"
          placeholder="Вдохновляющая цель"
        />
        <div className="flex justify-end mt-1.5">
          <Button size="sm" variant="ghost" onClick={saveObjective} disabled={!objDirty || savingObj}>
            <Icon name={savingObj ? 'Loader2' : 'Save'} size={11} className={`mr-1 ${savingObj ? 'animate-spin' : ''}`} />
            Сохранить
          </Button>
        </div>
      </div>

      {/* KR header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="ListChecks" size={14} className="text-violet-700" />
          <Label className="text-xs font-semibold text-violet-700">
            Key Results ({krs.length}/5)
          </Label>
          {preview.overshoot && (
            <Badge variant="outline" className="text-[9px] border-violet-300 text-violet-700">
              перевыполнено
            </Badge>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={addKr} disabled={krs.length >= 5}>
          <Icon name="Plus" size={11} className="mr-1" /> KR
        </Button>
      </div>

      {/* KR list */}
      {krs.length === 0 && (
        <div className="text-[11px] text-gray-400 italic rounded-xl border-2 border-dashed border-violet-100 p-3 text-center">
          Нет ключевых результатов. Добавь минимум один — без KR прогресс OKR = 0%.
        </div>
      )}

      <div className="space-y-2">
        {krs.map((kr, idx) => (
          <KrRow
            key={kr.id}
            kr={kr}
            index={idx}
            weightShare={totalWeight > 0 ? ((kr.weight && kr.weight > 0 ? kr.weight : 1) / totalWeight) * 100 : 0}
            onChange={(patch) => updateKr(kr.id, patch)}
            onRemove={() => removeKr(kr.id)}
          />
        ))}
      </div>

      {/* Общий прогресс цели */}
      <div className="rounded-xl bg-violet-50 border border-violet-100 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[11px] font-semibold text-violet-700 uppercase">Общий прогресс OKR</div>
          <div className="text-xl font-extrabold text-violet-700">{preview.execution}%</div>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
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
    </div>
  );
}

function KrRow({
  kr,
  index,
  weightShare,
  onChange,
  onRemove,
}: {
  kr: GoalKeyResult;
  index: number;
  weightShare: number;
  onChange: (patch: Partial<GoalKeyResult>) => void;
  onRemove: () => void;
}) {
  // Прогресс одного KR — clamp 0..100
  const span = kr.targetValue - kr.startValue;
  const rawRatio = span === 0 ? (kr.status === 'done' ? 1 : 0) : (kr.currentValue - kr.startValue) / span;
  const krOver = rawRatio > 1;
  const krPct = Math.max(0, Math.min(100, Math.round(rawRatio * 100)));

  return (
    <div className="rounded-xl bg-white border border-violet-100 p-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-violet-700">KR #{index + 1}</span>
        <Input
          value={kr.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="flex-1 h-7 text-xs"
        />
        <Button size="icon" variant="ghost" className="h-6 w-6 text-rose-600" onClick={onRemove}>
          <Icon name="X" size={12} />
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        <div>
          <Label className="text-[10px] text-gray-500">Тип</Label>
          <Select
            value={kr.metricType}
            onValueChange={(v) => onChange({ metricType: v as GoalKeyResult['metricType'] })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Число</SelectItem>
              <SelectItem value="percent">Процент</SelectItem>
              <SelectItem value="boolean">Да/Нет</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] text-gray-500">Старт</Label>
          <Input
            type="number"
            inputMode="decimal"
            className="h-7 text-xs"
            value={kr.startValue}
            onChange={(e) => onChange({ startValue: Number(e.target.value) || 0 })}
            disabled={kr.metricType === 'boolean'}
          />
        </div>
        <div>
          <Label className="text-[10px] text-gray-500">Сейчас</Label>
          <Input
            type="number"
            inputMode="decimal"
            className="h-7 text-xs border-violet-300"
            value={kr.currentValue}
            onChange={(e) => onChange({ currentValue: Number(e.target.value) || 0 })}
            disabled={kr.metricType === 'boolean'}
          />
        </div>
        <div>
          <Label className="text-[10px] text-gray-500">Цель</Label>
          <Input
            type="number"
            inputMode="decimal"
            className="h-7 text-xs"
            value={kr.targetValue}
            onChange={(e) => onChange({ targetValue: Number(e.target.value) || 0 })}
            disabled={kr.metricType === 'boolean'}
          />
        </div>
        <div>
          <Label className="text-[10px] text-gray-500">Вес</Label>
          <Input
            type="number"
            inputMode="numeric"
            className="h-7 text-xs"
            value={kr.weight ?? ''}
            onChange={(e) => onChange({ weight: e.target.value === '' ? 1 : Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${krOver ? 'bg-violet-700' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}`}
            style={{ width: `${krPct}%` }}
          />
        </div>
        <span className="text-[10px] font-semibold text-violet-700 min-w-[28px] text-right">{krPct}%</span>
        {kr.metricType === 'boolean' && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[10px] px-2"
            onClick={() => onChange({ status: kr.status === 'done' ? 'active' : 'done' })}
          >
            {kr.status === 'done' ? 'Снять' : 'Готово'}
          </Button>
        )}
        <span className="text-[9px] text-gray-400">вес {weightShare.toFixed(0)}%</span>
        {krOver && (
          <Badge variant="outline" className="text-[9px] border-violet-300 text-violet-700">
            overshoot
          </Badge>
        )}
      </div>
    </div>
  );
}
