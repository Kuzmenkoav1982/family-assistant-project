import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import PortfolioHeader from '@/components/portfolio/PortfolioHeader';
import SpheresRadar from '@/components/portfolio/SpheresRadar';
import DevelopmentTable from '@/components/portfolio/DevelopmentTable';
import ActiveDevelopmentPlan from '@/components/portfolio/ActiveDevelopmentPlan';
import AchievementsWall from '@/components/portfolio/AchievementsWall';
import SourcesDrawer from '@/components/portfolio/SourcesDrawer';
import { portfolioApi } from '@/services/portfolioApi';
import type { PortfolioData } from '@/types/portfolio.types';

export default function MemberPortfolio() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    portfolioApi
      .get(memberId)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [memberId]);

  const handleRefresh = async () => {
    if (!memberId) return;
    setRefreshing(true);
    try {
      const fresh = await portfolioApi.aggregate(memberId);
      const full = await portfolioApi.get(memberId);
      setData(full);
    } catch (e) {
      setError(String(e));
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Собираем портфолио…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {error || 'Не удалось загрузить портфолио'}
            </p>
            <Button onClick={() => navigate(-1)}>Вернуться</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <SEOHead title={`Портфолио ${data.member.name}`} description="Паспорт развития" />
      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-6">
        <PortfolioHeader data={data} />

        <div className="flex flex-wrap gap-2 justify-end">
          <SourcesDrawer data={data} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <Icon
              name="RefreshCw"
              size={14}
              className={refreshing ? 'animate-spin' : ''}
            />
            Пересчитать
          </Button>
        </div>

        <SpheresRadar data={data} />

        <DevelopmentTable data={data} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveDevelopmentPlan data={data} />
          <AchievementsWall data={data} />
        </div>

        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Icon name="Info" size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1 text-foreground">Как читать портфолио</p>
              <p>
                Это <span className="font-medium">паспорт развития</span> {data.member.name}.
                Сравнение идёт <span className="font-medium">с самим собой во времени</span>,
                а не с другими. Если по сфере мало данных — балл не показывается, чтобы не делать
                поспешных выводов.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
