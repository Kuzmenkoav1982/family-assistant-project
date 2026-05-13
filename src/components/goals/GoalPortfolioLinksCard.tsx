import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AttachPortfolioDialog from './AttachPortfolioDialog';
import { lifeApi } from '@/components/life-road/api';
import type { GoalPortfolioLink, LifeGoal } from '@/components/life-road/types';

// Блок связанных Portfolio items на странице цели (Этап 3.3.1).
// Контракт: справочная связь, manual attach. Не меняет progress цели.

interface Props {
  goal: LifeGoal;
  refreshKey?: number;
}

export default function GoalPortfolioLinksCard({ goal, refreshKey }: Props) {
  const navigate = useNavigate();
  const [links, setLinks] = useState<GoalPortfolioLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const [detachingId, setDetachingId] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await lifeApi.listPortfolioLinks(goal.id);
      setLinks(list);
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

  const handleDetach = async (linkId: string) => {
    setDetachingId(linkId);
    try {
      await lifeApi.detachPortfolioItem(linkId);
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDetachingId(null);
    }
  };

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center">
          <Icon name="Award" size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-900">Связанные материалы и достижения</div>
          <div className="text-[11px] text-gray-500">
            Привязки из Портфолио — справочные, на прогресс цели не влияют
          </div>
        </div>
        <Button size="sm" onClick={() => setAttachOpen(true)}>
          <Icon name="Plus" size={12} className="mr-1" /> Привязать
        </Button>
      </div>

      {loading && (
        <div className="text-xs text-gray-400 italic flex items-center gap-2">
          <Icon name="Loader2" size={12} className="animate-spin" /> Загружаем...
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</div>
      )}

      {!loading && !error && links.length === 0 && (
        <div className="text-xs text-gray-400 italic rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
          Пока нет привязанных материалов. Нажми «Привязать» — выбери достижение или план из Портфолио.
        </div>
      )}

      {links.length > 0 && (
        <div className="space-y-1.5">
          {links.map((l) => {
            const meta = (l.meta || {}) as { sourceTitle?: string };
            // Title resolution: live data → snapshot из meta → fallback.
            const title = l.itemTitle || meta.sourceTitle || 'Материал';
            const isBroken = !l.itemTitle; // JOIN ничего не нашёл — item удалён или скрыт от семьи.
            return (
              <div
                key={l.id}
                className="flex items-center gap-2 text-xs bg-white rounded-lg border border-gray-100 p-2"
              >
                <Icon
                  name={l.itemIcon || (l.itemType === 'achievement' ? 'Award' : 'Map')}
                  size={14}
                  className={isBroken ? 'text-gray-400 flex-shrink-0' : 'text-amber-600 flex-shrink-0'}
                />
                <div className="flex-1 min-w-0">
                  <div className={`truncate ${isBroken ? 'text-gray-500 italic' : 'text-gray-800'}`}>
                    {title}
                    {isBroken && (
                      <span className="ml-1.5 text-[10px] text-amber-600">(материал недоступен)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-700">
                      {l.itemType === 'achievement' ? 'достижение' : 'план развития'}
                    </Badge>
                    {l.itemSphere && (
                      <span className="text-[10px] text-gray-500">{l.itemSphere}</span>
                    )}
                    {l.itemEarnedAt && (
                      <span className="text-[10px] text-gray-400">
                        {new Date(l.itemEarnedAt).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                </div>
                {!isBroken && (
                  <button
                    onClick={() => navigate('/portfolio')}
                    className="text-gray-400 hover:text-amber-600 flex-shrink-0"
                    title="Открыть Портфолио"
                  >
                    <Icon name="ArrowUpRight" size={12} />
                  </button>
                )}
                <button
                  onClick={() => handleDetach(l.id)}
                  className="text-rose-400 hover:text-rose-600 flex-shrink-0"
                  title="Отвязать"
                  disabled={detachingId === l.id}
                >
                  <Icon name={detachingId === l.id ? 'Loader2' : 'X'} size={12} className={detachingId === l.id ? 'animate-spin' : ''} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AttachPortfolioDialog
        open={attachOpen}
        onOpenChange={setAttachOpen}
        goalId={goal.id}
        onAttached={reload}
      />
    </div>
  );
}