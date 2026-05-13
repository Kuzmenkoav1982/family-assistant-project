import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { lifeApi } from '@/components/life-road/api';
import type { PortfolioItemType, PortfolioPickerItem } from '@/components/life-road/types';

// Picker для manual attach Portfolio item к цели (Этап 3.3.1).
// Family-safe: бэкенд отдаёт только items текущей семьи.
// Исключает уже привязанные к этой цели items (excludeGoalId).

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  goalId: string;
  /** Куда переходить, если у пользователя нет ни одного item. */
  portfolioPath?: string;
  onAttached?: () => void;
}

// Variant A: пока поддерживаем только achievement. Архитектура готова к расширению.
export default function AttachPortfolioDialog({
  open,
  onOpenChange,
  goalId,
  portfolioPath = '/portfolio',
  onAttached,
}: Props) {
  const itemType: PortfolioItemType = 'achievement';
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<PortfolioPickerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachingId, setAttachingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounced(query, 250);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await lifeApi.portfolioPicker({
        itemType,
        q: debouncedQuery || undefined,
        excludeGoalId: goalId,
        limit: 50,
      });
      setItems(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, itemType, debouncedQuery, goalId]);

  const handleAttach = async (item: PortfolioPickerItem) => {
    setAttachingId(item.id);
    setError(null);
    try {
      await lifeApi.attachPortfolioItem({
        goalId,
        itemType: item.itemType,
        itemId: item.id,
        meta: { source: 'manual', sourceTitle: item.title },
      });
      onAttached?.();
      // Удалим из списка локально — он сразу исчезает.
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAttachingId(null);
    }
  };

  const empty = !loading && !error && items.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[calc(100vw-1rem)] sm:w-auto max-h-[92vh] overflow-hidden p-4 sm:p-6 flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon name="Link2" size={22} />
            Привязать из Портфолио
          </DialogTitle>
          <DialogDescription>
            Связь справочная — она не меняет прогресс цели и не редактирует материал в Портфолио.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5 pt-2">
          <Button type="button" size="sm" variant="default" className="text-xs h-8" disabled>
            <Icon name="Award" size={12} className="mr-1" />
            Достижения
          </Button>
        </div>

        <div className="relative mt-2">
          <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию..."
            className="pl-8 h-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-3 -mx-1 px-1">
          {loading && (
            <div className="text-xs text-gray-500 italic flex items-center gap-2 py-3">
              <Icon name="Loader2" size={12} className="animate-spin" /> Ищем материалы...
            </div>
          )}

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</div>
          )}

          {empty && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
              <Icon name="Inbox" size={20} className="mx-auto text-gray-400 mb-1.5" />
              <div className="text-xs text-gray-500 mb-2">
                {query
                  ? 'Ничего не найдено по этому запросу.'
                  : 'В Портфолио пока нет подходящих материалов или все уже привязаны.'}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  setTimeout(() => {
                    window.location.assign(portfolioPath);
                  }, 100);
                }}
              >
                <Icon name="ArrowUpRight" size={12} className="mr-1" /> Перейти в Портфолио
              </Button>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="space-y-1.5">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-2 text-xs bg-white rounded-lg border border-gray-100 p-2"
                >
                  <Icon
                    name={it.icon || (it.itemType === 'achievement' ? 'Award' : 'Map')}
                    size={14}
                    className="text-amber-600 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{it.title}</div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                      {it.sphereKey && (
                        <Badge variant="outline" className="text-[9px] border-amber-200 text-amber-700">
                          {it.sphereKey}
                        </Badge>
                      )}
                      {it.earnedAt && (
                        <span>
                          <Icon name="Calendar" size={9} className="inline mr-0.5" />
                          {new Date(it.earnedAt).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                      {it.status && <span>{it.status}</span>}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleAttach(it)} disabled={attachingId === it.id}>
                    <Icon
                      name={attachingId === it.id ? 'Loader2' : 'Plus'}
                      size={12}
                      className={`mr-1 ${attachingId === it.id ? 'animate-spin' : ''}`}
                    />
                    Привязать
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Готово
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useDebounced<T>(value: T, delay: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}