import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { portfolioApi } from '@/services/portfolioApi';
import type { FamilyPortfolioListItem } from '@/types/portfolio.types';

export function PortfolioWidget() {
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
        const children = (r.members || []).filter(
          (m) => m.age !== null && m.age <= 17,
        );
        setItems(children.length ? children : (r.members || []).slice(0, 4));
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
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon name="Sparkles" size={14} className="text-primary" />
            Портфолио развития
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-12 rounded-lg bg-muted/40 animate-pulse" />
          <div className="h-12 rounded-lg bg-muted/40 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!familyId || items.length === 0) {
    return (
      <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <CardContent className="pt-5 text-center pb-5">
          <Icon name="Sparkles" size={28} className="mx-auto mb-2 text-primary/60" />
          <p className="text-sm font-semibold mb-1">Портфолио развития</p>
          <p className="text-xs text-muted-foreground mb-3">
            Карта развития каждого члена семьи по 8 сферам
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate('/portfolio')}>
            <Icon name="ArrowRight" size={12} className="mr-1" />
            Открыть
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon name="Sparkles" size={14} className="text-primary" />
          Портфолио развития
          <button
            type="button"
            onClick={() => navigate('/portfolio')}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Все
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.slice(0, 4).map((m) => {
          const initials = m.name?.slice(0, 2).toUpperCase() || '??';
          const top = m.strengths?.[0];
          const focus = m.growth_zones?.[0];
          const empty = !m.has_portfolio || m.completeness === 0;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => navigate(`/portfolio/${m.id}`)}
              className="w-full flex items-start gap-2.5 p-2.5 rounded-lg border bg-card hover:bg-muted/30 transition-colors text-left"
            >
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarImage src={m.photo_url || undefined} alt={m.name} />
                <AvatarFallback className="text-[11px] bg-gradient-to-br from-primary to-purple-500 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-sm font-semibold truncate">{m.name}</span>
                  {!empty && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {m.completeness}%
                    </Badge>
                  )}
                </div>
                {empty ? (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Данных пока нет — открыть и заполнить
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {top && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-green-700 dark:text-green-400">
                        <Icon name="TrendingUp" size={9} />
                        {top.label}
                      </span>
                    )}
                    {focus && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 dark:text-amber-400">
                        <Icon name="Target" size={9} />
                        {focus.label}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default PortfolioWidget;