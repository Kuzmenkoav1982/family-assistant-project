import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { lifeApi } from '@/components/life-road/api';
import type { GoalActionLink } from '@/components/life-road/types';

// Origin-блок «Из Мастерской» для UI Планирования (Этап 3.2.1).
// Правила:
//  • Только справочная связь. Статус задачи НЕ меняет progress цели.
//  • Read-only UI: показываем источник, даём перейти, не редактируем.
//  • Безопасен к битым ссылкам: если goal/milestone/KR удалены — отображаем gracefully.
//  • Если у задачи несколько workshop-links — показываем все.

interface Props {
  taskId: string;
  /** Опционально: подложить уже загруженные links, чтобы не делать второй запрос. */
  preloaded?: GoalActionLink[];
  /** Компактный вариант (одна строка в карточке задачи). */
  compact?: boolean;
}

export default function TaskWorkshopOrigin({ taskId, preloaded, compact }: Props) {
  const navigate = useNavigate();
  const [links, setLinks] = useState<GoalActionLink[] | null>(preloaded ?? null);
  const [loading, setLoading] = useState(!preloaded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preloaded) {
      setLinks(preloaded);
      setLoading(false);
      return;
    }
    if (!taskId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    lifeApi
      .listLinksByEntity('task', taskId)
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
  }, [taskId, preloaded]);

  // Скрываем блок, если нет связей. Не ломает task UI.
  if (loading || error || !links || links.length === 0) return null;

  return (
    <div className={compact ? 'mt-2' : 'mt-3 rounded-xl bg-purple-50/60 border border-purple-100 p-2.5'}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon name="Compass" size={12} className="text-purple-700" />
        <span className="text-[10px] font-bold text-purple-700 uppercase">Из Мастерской</span>
        {links.length > 1 && (
          <Badge variant="outline" className="text-[9px] border-purple-300 text-purple-700 ml-1">
            {links.length} связей
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        {links.map((l) => (
          <OriginRow key={l.id} link={l} onOpen={(goalId) => navigate(`/workshop/goal/${goalId}`)} />
        ))}
      </div>
    </div>
  );
}

const SRC_BADGE: Record<string, { label: string; icon: string }> = {
  goal: { label: 'цель', icon: 'Target' },
  milestone: { label: 'веха', icon: 'Flag' },
  keyresult: { label: 'KR', icon: 'Crosshair' },
};

function OriginRow({ link, onOpen }: { link: GoalActionLink; onOpen: (goalId: string) => void }) {
  const meta = (link.meta || {}) as { source?: string; sourceTitle?: string };
  const src = meta.source || 'goal';
  const badge = SRC_BADGE[src] || SRC_BADGE.goal;

  // Заголовок источника: предпочитаем live-данные (milestone/KR title), fallback на meta.sourceTitle,
  // в самом крайнем — короткий id.
  let sourceTitle: string | null = null;
  if (src === 'milestone') sourceTitle = link.milestoneTitle || meta.sourceTitle || null;
  else if (src === 'keyresult') sourceTitle = link.keyResultTitle || meta.sourceTitle || null;
  else sourceTitle = link.goalTitle || meta.sourceTitle || null;

  // Признаки «битой» ссылки
  const goalAvailable = !!link.goalTitle;
  const milestoneBroken = !!link.milestoneId && !link.milestoneTitle;
  const keyResultBroken = !!link.keyResultId && !link.keyResultTitle;
  const sourceBroken = (src === 'milestone' && milestoneBroken) || (src === 'keyresult' && keyResultBroken);

  // Цель: всегда показываем, если есть. Если только goal нет — серый бейдж без перехода.
  if (!goalAvailable) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Icon name="UnlinkIcon" fallback="Unlink" size={11} className="text-gray-400" />
        <span className="italic">Источник недоступен</span>
        <Badge variant="outline" className="text-[9px] border-gray-300 text-gray-500">
          <Icon name={badge.icon} size={9} className="mr-0.5" /> {badge.label}
        </Badge>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(link.goalId)}
      className="w-full flex items-center gap-1.5 text-xs text-gray-700 hover:text-purple-700 transition-colors text-left"
      title="Открыть цель в Мастерской"
    >
      <Badge variant="outline" className="text-[9px] border-purple-300 text-purple-700 flex-shrink-0">
        <Icon name={badge.icon} size={9} className="mr-0.5" /> {badge.label}
      </Badge>
      <span className="flex-1 truncate">
        {sourceTitle || <span className="italic text-gray-500">без названия</span>}
        {sourceBroken && (
          <span className="ml-1 text-[10px] text-amber-600 italic">
            (источник внутри цели удалён)
          </span>
        )}
      </span>
      <span className="text-[10px] text-gray-400 truncate flex-shrink-0">
        → {link.goalTitle}
      </span>
      <Icon name="ArrowUpRight" size={11} className="text-gray-400 flex-shrink-0" />
    </button>
  );
}
