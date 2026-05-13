import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { lifeApi } from '@/components/life-road/api';
import type { GoalPortfolioLink } from '@/components/life-road/types';

// Обратная сторона связи Workshop <-> Portfolio (Этап 3.3.2).
// Показывает, с какими целями связано конкретное достижение.
// Read-only. Никаких side-effects в Workshop. Если goal удалена — JOIN отсеет.

interface Props {
  achievementId: string;
  /** Компактный вариант (одна строка в карточке). */
  compact?: boolean;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  done: { label: 'Достигнуто', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  active: { label: 'Активна', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  paused: { label: 'Пауза', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  archived: { label: 'Архив', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export default function AchievementLinkedGoals({ achievementId, compact }: Props) {
  const navigate = useNavigate();
  const [links, setLinks] = useState<GoalPortfolioLink[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!achievementId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    lifeApi
      .listPortfolioLinksByItem('achievement', achievementId)
      .then((list) => {
        if (cancelled) return;
        setLinks(list);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        // Безопасный fallback: не показываем блок, не ломаем родителя.
        setError(e.message);
        setLinks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [achievementId]);

  // Скрываем блок если нет связей или ошибка — карточка достижения не ломается.
  if (loading || error || !links || links.length === 0) return null;

  return (
    <div className={compact ? 'mt-2' : 'mt-3 rounded-xl bg-purple-50/60 border border-purple-100 p-2.5'}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon name="Compass" size={12} className="text-purple-700" />
        <span className="text-[10px] font-bold text-purple-700 uppercase">Связано с целями</span>
        {links.length > 1 && (
          <Badge variant="outline" className="text-[9px] border-purple-300 text-purple-700 ml-1">
            {links.length}
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        {links.map((l) => {
          const status = STATUS_BADGE[l.goalStatus || ''] || null;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => navigate(`/workshop/goal/${l.goalId}`)}
              className="w-full flex items-center gap-1.5 text-xs text-gray-700 hover:text-purple-700 transition-colors text-left"
              title="Открыть цель в Мастерской"
            >
              <Icon name="Target" size={11} className="text-purple-600 flex-shrink-0" />
              <span className="flex-1 truncate">
                {l.goalTitle || <span className="italic text-gray-500">без названия</span>}
              </span>
              {status && (
                <Badge variant="outline" className={`text-[9px] flex-shrink-0 ${status.cls}`}>
                  {status.label}
                </Badge>
              )}
              <Icon name="ArrowUpRight" size={11} className="text-gray-400 flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
