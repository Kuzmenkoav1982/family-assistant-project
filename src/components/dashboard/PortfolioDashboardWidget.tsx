import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { portfolioApi } from '@/services/portfolioApi';
import { SPHERE_ORDER } from '@/types/portfolio.types';
import type { FamilyPortfolioListItem } from '@/types/portfolio.types';

export default function PortfolioDashboardWidget() {
  const navigate = useNavigate();
  const { familyId } = useFamilyMembersContext();
  const [items, setItems] = useState<FamilyPortfolioListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    portfolioApi
      .list(familyId)
      .then((r) => {
        if (cancelled) return;
        const children = (r.members || []).filter((m) => m.has_portfolio);
        setItems(children);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [familyId]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-4">
        <div className="h-4 w-32 bg-muted/50 rounded mb-3 animate-pulse" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
          <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  const familyAvg = (() => {
    const all: number[] = [];
    items.forEach((m) => {
      SPHERE_ORDER.forEach((s) => {
        const v = m.scores?.[s];
        if (typeof v === 'number') all.push(v);
      });
    });
    if (!all.length) return 0;
    return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
  })();

  const totalCompleteness = items.length
    ? Math.round(items.reduce((a, m) => a + (m.completeness || 0), 0) / items.length)
    : 0;

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-4 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Icon name="Sparkles" size={14} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Портфолио развития</h3>
            <p className="text-[11px] text-muted-foreground leading-none">
              {items.length} {items.length === 1 ? 'паспорт' : items.length < 5 ? 'паспорта' : 'паспортов'} семьи
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/portfolio')}
          className="text-xs text-primary hover:underline"
        >
          Открыть →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/15">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Средний уровень
          </p>
          <p className="text-xl font-bold text-primary leading-tight">{familyAvg}</p>
          <p className="text-[10px] text-muted-foreground">из 100 по семье</p>
        </div>
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/15">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Заполненность
          </p>
          <p className="text-xl font-bold text-emerald-600 leading-tight">
            {totalCompleteness}%
          </p>
          <p className="text-[10px] text-muted-foreground">в среднем</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {items.slice(0, 3).map((m) => {
          const initials = m.name?.slice(0, 2).toUpperCase() || '??';
          const top = m.strengths?.[0];
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => navigate(`/portfolio/${m.id}`)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors text-left"
            >
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={m.photo_url || undefined} alt={m.name} />
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-purple-500 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{m.name}</p>
                {top ? (
                  <p className="text-[10px] text-muted-foreground truncate">
                    Топ: {top.label}
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    {m.completeness}% заполнено
                  </p>
                )}
              </div>
              <Icon name="ChevronRight" size={14} className="text-muted-foreground flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
