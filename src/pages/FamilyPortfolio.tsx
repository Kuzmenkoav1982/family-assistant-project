import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { portfolioApi } from '@/services/portfolioApi';
import type { FamilyPortfolioListItem } from '@/types/portfolio.types';

export default function FamilyPortfolio() {
  const navigate = useNavigate();
  const { familyId } = useFamilyMembersContext();
  const [items, setItems] = useState<FamilyPortfolioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }
    portfolioApi
      .list(familyId)
      .then((res) => {
        setItems(res.members);
        setError(null);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [familyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Собираем портфолио семьи…</p>
        </div>
      </div>
    );
  }

  if (!familyId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Сначала создайте семью, чтобы видеть портфолио
            </p>
            <Button onClick={() => navigate('/family-management')}>
              Создать семью
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <SEOHead title="Портфолио семьи" description="Паспорта развития всех членов семьи" />
      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Icon name="Sparkles" size={20} className="text-white" />
            </span>
            Портфолио семьи
          </h1>
          <p className="text-muted-foreground">
            Паспорт развития каждого члена семьи. Сравнение с собой во времени, без рейтингов.
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/50">
            <CardContent className="pt-6 text-destructive">{error}</CardContent>
          </Card>
        )}

        {items.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
              <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
              <p>В семье пока нет членов с портфолио</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((m) => {
              const initials = m.name?.slice(0, 2).toUpperCase() || '??';
              return (
                <Card
                  key={m.id}
                  className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border-0 shadow-sm"
                  onClick={() => navigate(`/portfolio/${m.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="w-14 h-14 border-2 border-background shadow-sm">
                        <AvatarImage src={m.photo_url || undefined} alt={m.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">{m.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {m.role}
                          {m.age !== null && ` · ${m.age} лет`}
                        </p>
                      </div>
                      <Icon name="ChevronRight" size={18} className="text-muted-foreground" />
                    </div>

                    {m.has_portfolio ? (
                      <>
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">Заполненность</span>
                            <span className="text-xs font-semibold">{m.completeness}%</span>
                          </div>
                          <Progress value={m.completeness} className="h-1.5" />
                        </div>

                        <div className="space-y-1.5">
                          {m.strengths.length > 0 && (
                            <div className="flex items-start gap-1.5">
                              <Icon
                                name="Star"
                                size={12}
                                className="text-amber-500 mt-0.5 flex-shrink-0"
                              />
                              <div className="flex flex-wrap gap-1">
                                {m.strengths.slice(0, 2).map((s) => (
                                  <Badge
                                    key={s.sphere}
                                    variant="secondary"
                                    className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                                  >
                                    {s.label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {m.growth_zones.length > 0 && (
                            <div className="flex items-start gap-1.5">
                              <Icon
                                name="TrendingUp"
                                size={12}
                                className="text-blue-500 mt-0.5 flex-shrink-0"
                              />
                              <div className="flex flex-wrap gap-1">
                                {m.growth_zones.slice(0, 2).map((s) => (
                                  <Badge
                                    key={s.sphere}
                                    variant="secondary"
                                    className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                                  >
                                    {s.label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-2 text-xs text-muted-foreground">
                        <Icon name="Sparkles" size={20} className="mx-auto mb-1 opacity-50" />
                        Откройте, чтобы создать портфолио
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Хотите посмотреть, как выглядит готовое портфолио? Откройте демо-профиль Ильи, 5 лет.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/portfolio/000000d1-0000-0000-0000-000000000001')}
            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-0 shadow-md gap-2 px-8"
          >
            <Icon name="Sparkles" size={18} />
            Песочница
            <span className="text-xs opacity-80 ml-1">(демо: Илья 5 лет)</span>
          </Button>
        </div>
      </div>
    </div>
  );
}