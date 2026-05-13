import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { lifeApi } from '@/components/life-road/api';
import type { GoalActionLink, LifeGoal } from '@/components/life-road/types';

// Связанные задачи на странице цели (Этап 3.2.2).
// Показываем только справочный execution layer.
// completion задач НЕ меняет progress цели — это правило этапа 3.

interface Props {
  goal: LifeGoal;
  onCreateClick: () => void;
  refreshKey?: number;
}

const SOURCE_BADGE: Record<string, { label: string; icon: string }> = {
  goal: { label: 'от цели', icon: 'Target' },
  milestone: { label: 'от вехи', icon: 'Flag' },
  keyresult: { label: 'от KR', icon: 'Crosshair' },
};

export default function GoalLinkedTasksCard({ goal, onCreateClick, refreshKey }: Props) {
  const navigate = useNavigate();
  const [links, setLinks] = useState<GoalActionLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await lifeApi.listLinks(goal.id);
      setLinks(list.filter((l) => l.entityType === 'task'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal.id, refreshKey]);

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center">
          <Icon name="ListTodo" size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-900">Связанные задачи</div>
          <div className="text-[11px] text-gray-500">Справочный план — не влияет на прогресс цели</div>
        </div>
        <Button size="sm" onClick={onCreateClick}>
          <Icon name="Plus" size={12} className="mr-1" /> Задача
        </Button>
      </div>

      {loading && (
        <div className="text-xs text-gray-400 italic flex items-center gap-2">
          <Icon name="Loader2" size={12} className="animate-spin" /> Загружаем связи...
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</div>
      )}

      {!loading && !error && links.length === 0 && (
        <div className="text-xs text-gray-400 italic rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
          Пока нет связанных задач. Создай первую — она появится в Планировании и здесь.
        </div>
      )}

      {links.length > 0 && (
        <div className="space-y-1.5">
          {links.map((l) => {
            const meta = (l.meta || {}) as { source?: string; sourceTitle?: string };
            const badge = SOURCE_BADGE[meta.source || 'goal'] || SOURCE_BADGE.goal;
            return (
              <div
                key={l.id}
                className="flex items-center gap-2 text-xs bg-white rounded-lg border border-gray-100 p-2"
              >
                <Icon name="CheckSquare" size={12} className="text-blue-600 flex-shrink-0" />
                <span className="flex-1 truncate text-gray-800">
                  {meta.sourceTitle || `task ${l.entityId.slice(0, 8)}`}
                </span>
                <Badge variant="outline" className="text-[9px] border-blue-200 text-blue-700">
                  <Icon name={badge.icon} size={9} className="mr-0.5" /> {badge.label}
                </Badge>
                <button
                  onClick={() => navigate('/tasks')}
                  className="text-gray-400 hover:text-gray-700"
                  title="Открыть Планирование"
                >
                  <Icon name="ArrowUpRight" size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
