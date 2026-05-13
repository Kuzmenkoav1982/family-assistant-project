import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { lifeApi } from '@/components/life-road/api';
import type { GoalKeyResult, GoalMilestone, LifeGoal } from '@/components/life-road/types';

// Milestones — это исполнительский слой.
// Влияют на progress ТОЛЬКО для generic-целей (правило Этапа 2.3).
// Для SMART/OKR/Wheel milestone — справочный план, не источник прогресса.

interface Props {
  goal: LifeGoal;
  milestones: GoalMilestone[];
  keyResults: GoalKeyResult[];
  onChanged?: () => Promise<void> | void;
}

export default function GoalExecutionCard({ goal, milestones, keyResults, onChanged }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const affectsProgress = goal.frameworkType === 'generic';
  const hasItems = milestones.length > 0 || keyResults.length > 0 || (goal.steps?.length ?? 0) > 0;

  const addMilestone = async () => {
    if (!newTitle.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await lifeApi.createMilestone({
        goalId: goal.id,
        title: newTitle.trim(),
        dueDate: newDate || null,
        order: milestones.length,
      });
      setNewTitle('');
      setNewDate('');
      await onChanged?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggleMilestone = async (m: GoalMilestone) => {
    setError(null);
    try {
      await lifeApi.updateMilestone(m.id, { status: m.status === 'done' ? 'pending' : 'done' });
      await onChanged?.();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deleteMilestone = async (m: GoalMilestone) => {
    if (!confirm(`Удалить веху «${m.title}»?`)) return;
    setError(null);
    try {
      await lifeApi.deleteMilestone(m.id);
      await onChanged?.();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center">
          <Icon name="ListChecks" size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-900">Исполнение</div>
          <div className="text-[11px] text-gray-500">Вехи, шаги и ключевые результаты</div>
        </div>
        {!affectsProgress && (
          <Badge variant="outline" className="text-[9px] text-gray-500">
            <Icon name="Info" size={9} className="mr-0.5" /> справочный план
          </Badge>
        )}
      </div>

      {!hasItems && (
        <div className="text-xs text-gray-400 italic rounded-xl bg-slate-50 border border-slate-100 p-3 mb-3">
          Пока ничего нет. Добавь первую веху, чтобы наметить путь к цели.
        </div>
      )}

      {/* Milestones */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[11px] font-semibold text-gray-500 uppercase">Вехи ({milestones.length})</div>
          {!affectsProgress && milestones.length > 0 && (
            <span className="text-[9px] text-gray-400 italic">
              не влияют на прогресс {goal.frameworkType.toUpperCase()}
            </span>
          )}
        </div>

        <div className="space-y-1.5 mb-2">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 text-xs bg-white rounded-lg border border-gray-100 p-2"
            >
              <button onClick={() => toggleMilestone(m)} className="flex-shrink-0" title="Переключить">
                <Icon
                  name={m.status === 'done' ? 'CheckCircle2' : 'Circle'}
                  size={16}
                  className={m.status === 'done' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}
                />
              </button>
              <span className={`flex-1 ${m.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                {m.title}
              </span>
              {m.dueDate && (
                <span className="text-[10px] text-gray-400">
                  {new Date(m.dueDate).toLocaleDateString('ru-RU')}
                </span>
              )}
              <button
                onClick={() => deleteMilestone(m)}
                className="text-rose-500 hover:text-rose-700 flex-shrink-0"
                title="Удалить"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Inline add */}
        <div className="flex items-center gap-1.5">
          <Input
            placeholder="Добавить веху..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTitle.trim()) addMilestone();
            }}
            className="h-8 text-xs flex-1"
            disabled={busy}
          />
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="h-8 text-xs w-36"
            disabled={busy}
          />
          <Button size="sm" onClick={addMilestone} disabled={!newTitle.trim() || busy} className="h-8">
            <Icon name={busy ? 'Loader2' : 'Plus'} size={12} className={busy ? 'animate-spin' : ''} />
          </Button>
        </div>
        {error && <div className="text-[10px] text-rose-700 mt-1">{error}</div>}
      </div>

      {keyResults.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1.5">Ключевые результаты</div>
          <div className="space-y-1.5">
            {keyResults.map((kr) => (
              <div
                key={kr.id}
                className="flex items-center gap-2 text-xs bg-white rounded-lg border border-gray-100 p-2"
              >
                <Icon name="Target" size={14} className="text-violet-600" />
                <span className="text-gray-800">{kr.title}</span>
                <span className="ml-auto text-violet-700 font-semibold">
                  {kr.currentValue}/{kr.targetValue} {kr.unit || ''}
                </span>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-gray-400 italic mt-1">
            KR редактируются в панели OKR (выше).
          </div>
        </div>
      )}

      {goal.steps?.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1.5">Шаги (legacy)</div>
          <div className="space-y-1">
            {goal.steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <Icon
                  name={s.done ? 'CheckCircle2' : 'Circle'}
                  size={12}
                  className={s.done ? 'text-emerald-600' : 'text-gray-400'}
                />
                <span className={s.done ? 'text-gray-500 line-through' : 'text-gray-700'}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
