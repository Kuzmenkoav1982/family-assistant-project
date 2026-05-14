import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { LifeGoal } from '@/components/life-road/types';
import {
  useFocusActions,
  validateQuickCheckin,
  type FocusActionContext,
  type FocusActionKind,
  type QuickCheckinInput,
} from './useFocusActions';

// Goals Focus V2 — inline quick check-in.
// Используется для stale и regressed целей (для них новый замер действительно
// двигает причину из очереди).
//
// Контракт:
//   - один textarea: «что изменилось?»
//   - опционально: самооценка 0..10 (как стандартное поле check-in)
//   - валидация перед сохранением
//   - после успешного save → onSaved() (родитель закрывает раскрытый item и
//     зовёт onChanged(), который ведёт к reload в Workshop)
//   - Esc / Cancel → onCancel
//   - reduced motion / a11y: aria-label, focus на textarea при mount

interface Props {
  goal: LifeGoal;
  /** Подсказка в плейсхолдере, зависит от причины. */
  placeholder?: string;
  onSaved: () => void;
  onCancel: () => void;
  /** Прокидывается из FocusSection: reload + success toast. */
  onChanged: (kind: FocusActionKind, ctx: FocusActionContext) => void;
}

const DEFAULT_PLACEHOLDER =
  'Что изменилось? Что сделал/а с прошлого раза? (минимум 3 символа)';

export default function FocusQuickCheckin({
  goal,
  placeholder = DEFAULT_PLACEHOLDER,
  onSaved,
  onCancel,
  onChanged,
}: Props) {
  const [summary, setSummary] = useState('');
  const [withScore, setWithScore] = useState(false);
  const [score, setScore] = useState<number>(7);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const actions = useFocusActions({
    onChanged: (kind, _id, ctx) => onChanged(kind, ctx),
  });

  useEffect(() => {
    // Автофокус — пользователь сразу пишет, без лишнего клика.
    taRef.current?.focus();
  }, []);

  // Esc → cancel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !actions.busy) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel, actions.busy]);

  const input: QuickCheckinInput = {
    summary,
    selfAssessment: withScore ? score : null,
  };
  const validationError = validateQuickCheckin(input);
  const canSave = !validationError && !actions.busy;

  const handleSave = async () => {
    const created = await actions.quickCheckin(goal, input);
    if (created) onSaved();
  };

  return (
    <div
      className="rounded-xl border border-purple-200 bg-purple-50/40 p-3 space-y-2"
      role="region"
      aria-label={`Быстрый замер по цели «${goal.title}»`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-purple-800">
        <Icon name="MessageSquarePlus" size={14} />
        Быстрый замер
      </div>

      <Textarea
        ref={taRef}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder={placeholder}
        className="min-h-[72px] text-sm bg-white"
        maxLength={500}
        disabled={!!actions.busy}
        aria-invalid={summary.length > 0 && !!validationError}
      />

      <label className="flex items-center gap-2 text-[11px] text-gray-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={withScore}
          onChange={(e) => setWithScore(e.target.checked)}
          className="rounded"
          disabled={!!actions.busy}
        />
        Поставить самооценку 0–10
      </label>

      {withScore && (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="flex-1"
            disabled={!!actions.busy}
            aria-label="Самооценка от 0 до 10"
          />
          <span className="text-sm font-bold text-purple-700 w-7 text-right">
            {score}
          </span>
        </div>
      )}

      {actions.error && (
        <div role="alert" className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-2 py-1">
          {actions.error}
        </div>
      )}
      {!actions.error && summary.length > 0 && validationError && (
        <div className="text-[11px] text-amber-700">{validationError}</div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={!!actions.busy}
        >
          Отмена
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!canSave}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        >
          {actions.busy === 'checkin' ? (
            <>
              <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
              Сохраняю…
            </>
          ) : (
            <>
              <Icon name="Check" size={12} className="mr-1" />
              Сохранить замер
            </>
          )}
        </Button>
      </div>
    </div>
  );
}