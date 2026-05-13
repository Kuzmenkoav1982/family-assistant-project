import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

// Каноническая форма frameworkState для SMART (фикс правил):
// {
//   specific, metric, startValue, currentValue, targetValue, unit,
//   achievable, relevant, targetDate
// }
// Источник истины — frameworkState. deadline цели = targetDate.

export interface SmartFrameworkState {
  specific: string;
  metric: string;
  startValue: number | null;
  currentValue: number | null;
  targetValue: number | null;
  unit: string;
  achievable: string;
  relevant: string;
  targetDate: string;
}

export const SMART_INITIAL: SmartFrameworkState = {
  specific: '',
  metric: '',
  startValue: 0,
  currentValue: 0,
  targetValue: null,
  unit: '',
  achievable: '',
  relevant: '',
  targetDate: '',
};

export function validateSmart(s: SmartFrameworkState): string[] {
  const errors: string[] = [];
  if (!s.specific.trim()) errors.push('S — Конкретика: опиши что именно хочешь');
  if (!s.metric.trim()) errors.push('M — Метрика: как ты измеришь успех');
  if (s.targetValue === null || s.targetValue === undefined || Number.isNaN(Number(s.targetValue))) {
    errors.push('M — Целевое значение обязательно');
  }
  if (!s.targetDate) errors.push('T — Срок обязателен');
  return errors;
}

interface Props {
  value: SmartFrameworkState;
  onChange: (next: SmartFrameworkState) => void;
}

export default function SmartForm({ value, onChange }: Props) {
  const set = <K extends keyof SmartFrameworkState>(k: K, v: SmartFrameworkState[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-2 text-[11px] text-blue-700 flex items-start gap-1.5">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0" />
        <span>
          SMART = Конкретно / Измеримо / Достижимо / Релевантно / Срок. Заполни все 5 граней —
          и Домовой будет считать прогресс автоматически по метрике M.
        </span>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-blue-700">S — Конкретно <span className="text-rose-500">*</span></Label>
        <Textarea
          rows={2}
          placeholder="Что именно ты хочешь достичь? Например: «Пробежать 5 км без остановки»"
          value={value.specific}
          onChange={(e) => set('specific', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-blue-700">M — Метрика <span className="text-rose-500">*</span></Label>
          <Input
            placeholder="distance, дни, кг, %, статьи..."
            value={value.metric}
            onChange={(e) => set('metric', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Единица измерения</Label>
          <Input
            placeholder="km, дни, %, шт"
            value={value.unit}
            onChange={(e) => set('unit', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Старт</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={value.startValue ?? ''}
            onChange={(e) => set('startValue', e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-600">Сейчас</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={value.currentValue ?? ''}
            onChange={(e) => set('currentValue', e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-blue-700">Цель <span className="text-rose-500">*</span></Label>
          <Input
            type="number"
            inputMode="decimal"
            value={value.targetValue ?? ''}
            onChange={(e) => set('targetValue', e.target.value === '' ? null : Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-blue-700">A — Почему достижимо?</Label>
        <Textarea
          rows={2}
          placeholder="Какие ресурсы и условия делают цель реальной?"
          value={value.achievable}
          onChange={(e) => set('achievable', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-blue-700">R — Почему важно?</Label>
        <Textarea
          rows={2}
          placeholder="Зачем тебе это? Как это связано с большими целями?"
          value={value.relevant}
          onChange={(e) => set('relevant', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-blue-700">T — Срок <span className="text-rose-500">*</span></Label>
        <Input
          type="date"
          value={value.targetDate}
          onChange={(e) => set('targetDate', e.target.value)}
        />
        <p className="text-[10px] text-gray-500">
          Этот срок станет дедлайном цели. Отдельного поля «deadline» нет — у SMART срок один.
        </p>
      </div>
    </div>
  );
}
