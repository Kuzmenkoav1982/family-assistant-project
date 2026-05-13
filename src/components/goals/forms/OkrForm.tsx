import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

// Каноническая форма OKR.
// frameworkState содержит ТОЛЬКО metadata (objective).
// Сами KR — отдельная таблица goal_key_results.
// Локально (до submit) KR живут в этом компоненте, после submit отправляются батчем.

export interface OkrFrameworkState {
  objective: string;
}

export interface OkrKeyResultDraft {
  title: string;
  metricType: 'number' | 'percent' | 'boolean';
  startValue: number;
  targetValue: number;
  unit: string;
  dueDate: string;
  weight: number | null;
}

export const OKR_INITIAL: OkrFrameworkState = {
  objective: '',
};

export const OKR_KR_INITIAL: OkrKeyResultDraft = {
  title: '',
  metricType: 'number',
  startValue: 0,
  targetValue: 0,
  unit: '',
  dueDate: '',
  weight: null,
};

export function validateOkr(state: OkrFrameworkState, krs: OkrKeyResultDraft[]): string[] {
  const errors: string[] = [];
  if (!state.objective.trim()) errors.push('Objective обязателен — это вдохновляющая цель');
  if (krs.length === 0) errors.push('Минимум 1 Key Result');
  if (krs.length > 5) errors.push('Максимум 5 Key Results');
  krs.forEach((kr, i) => {
    if (!kr.title.trim()) errors.push(`KR #${i + 1}: заголовок обязателен`);
    if (kr.metricType !== 'boolean' && kr.targetValue === kr.startValue) {
      errors.push(`KR #${i + 1}: target должен отличаться от start`);
    }
  });
  return errors;
}

/** Если веса не заданы (null/0) — распределить равномерно по 1. */
export function normalizeOkrWeights(krs: OkrKeyResultDraft[]): OkrKeyResultDraft[] {
  const hasWeights = krs.some((k) => k.weight && k.weight > 0);
  if (hasWeights) return krs.map((k) => ({ ...k, weight: k.weight || 1 }));
  return krs.map((k) => ({ ...k, weight: 1 }));
}

interface Props {
  value: OkrFrameworkState;
  onChange: (next: OkrFrameworkState) => void;
  keyResults: OkrKeyResultDraft[];
  onKeyResultsChange: (next: OkrKeyResultDraft[]) => void;
}

export default function OkrForm({ value, onChange, keyResults, onKeyResultsChange }: Props) {
  const canAdd = keyResults.length < 5;

  const addKr = () => {
    if (!canAdd) return;
    onKeyResultsChange([...keyResults, { ...OKR_KR_INITIAL }]);
  };

  const removeKr = (i: number) => {
    onKeyResultsChange(keyResults.filter((_, idx) => idx !== i));
  };

  const patchKr = (i: number, patch: Partial<OkrKeyResultDraft>) => {
    onKeyResultsChange(keyResults.map((kr, idx) => (idx === i ? { ...kr, ...patch } : kr)));
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-violet-50/70 border border-violet-100 p-2 text-[11px] text-violet-700 flex items-start gap-1.5">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0" />
        <span>
          OKR = одна вдохновляющая цель (Objective) + 3-5 измеримых ключевых результатов (KR).
          Если оставить веса пустыми — все KR будут считаться равнозначными.
        </span>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-violet-700">
          Objective <span className="text-rose-500">*</span>
        </Label>
        <Textarea
          rows={2}
          placeholder="Например: «Наладить устойчивый режим физической активности»"
          value={value.objective}
          onChange={(e) => onChange({ ...value, objective: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-violet-700">
            Key Results ({keyResults.length}/5)
          </Label>
          <Button
            size="sm"
            variant="outline"
            onClick={addKr}
            disabled={!canAdd}
            className="h-7 text-xs"
            type="button"
          >
            <Icon name="Plus" size={12} className="mr-1" /> KR
          </Button>
        </div>

        {keyResults.length === 0 && (
          <div className="text-[11px] text-gray-400 italic rounded-xl border-2 border-dashed border-violet-100 p-3 text-center">
            Добавь минимум 1 ключевой результат — измеримый и со сроком.
          </div>
        )}

        {keyResults.map((kr, i) => (
          <div key={i} className="rounded-xl bg-white border border-violet-100 p-2.5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-violet-700">KR #{i + 1}</span>
              <Input
                placeholder="Что именно измеряем"
                value={kr.title}
                onChange={(e) => patchKr(i, { title: e.target.value })}
                className="flex-1 h-7 text-xs"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-rose-600"
                onClick={() => removeKr(i)}
                type="button"
              >
                <Icon name="X" size={12} />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              <div>
                <Label className="text-[10px] text-gray-500">Тип</Label>
                <Select
                  value={kr.metricType}
                  onValueChange={(v) => patchKr(i, { metricType: v as OkrKeyResultDraft['metricType'] })}
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
                  onChange={(e) => patchKr(i, { startValue: Number(e.target.value) || 0 })}
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
                  onChange={(e) => patchKr(i, { targetValue: Number(e.target.value) || 0 })}
                  disabled={kr.metricType === 'boolean'}
                />
              </div>
              <div>
                <Label className="text-[10px] text-gray-500">Ед.</Label>
                <Input
                  className="h-7 text-xs"
                  placeholder="кг, %, шт"
                  value={kr.unit}
                  onChange={(e) => patchKr(i, { unit: e.target.value })}
                  disabled={kr.metricType === 'boolean'}
                />
              </div>
              <div>
                <Label className="text-[10px] text-gray-500">Вес</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  className="h-7 text-xs"
                  placeholder="авто"
                  value={kr.weight ?? ''}
                  onChange={(e) =>
                    patchKr(i, { weight: e.target.value === '' ? null : Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <Label className="text-[10px] text-gray-500">Срок KR</Label>
              <Input
                type="date"
                className="h-7 text-xs"
                value={kr.dueDate}
                onChange={(e) => patchKr(i, { dueDate: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
