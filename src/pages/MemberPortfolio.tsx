import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import PortfolioHeader from '@/components/portfolio/PortfolioHeader';
import KeyHighlights from '@/components/portfolio/KeyHighlights';
import InsightsBlock from '@/components/portfolio/InsightsBlock';
import HistoryChart from '@/components/portfolio/HistoryChart';
import SpheresRadar from '@/components/portfolio/SpheresRadar';
import DevelopmentTable from '@/components/portfolio/DevelopmentTable';
import ActiveDevelopmentPlan from '@/components/portfolio/ActiveDevelopmentPlan';
import AchievementsWall from '@/components/portfolio/AchievementsWall';
import SourcesDrawer from '@/components/portfolio/SourcesDrawer';
import TrustBlock from '@/components/portfolio/TrustBlock';
import ImproveAccuracyBlock from '@/components/portfolio/ImproveAccuracyBlock';
import PortfolioSection from '@/components/portfolio/PortfolioSection';
import { Link } from 'react-router-dom';
import { portfolioApi } from '@/services/portfolioApi';
import type { PortfolioData } from '@/types/portfolio.types';
import { formatLastAggregated } from '@/lib/portfolio/portfolioHubHelpers';
import { buildRefreshToast } from '@/lib/portfolio/portfolioMemberHelpers';
import { shareToFamilyChat } from '@/services/familyChatShare';
import { buildPortfolioChatMessage } from '@/utils/portfolioShare';
import { useToast } from '@/hooks/use-toast';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { track } from '@/lib/analytics';

export default function MemberPortfolio() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();
  const pdfEnabled = useFeatureFlag('portfolio_pdf_export', true);
  const aiEnabled = useFeatureFlag('portfolio_ai_insights', true);

  // Загрузка/повторная загрузка — единый путь, чтобы Retry в error-state
  // ходил по тому же коду, что и первичная загрузка страницы.
  const load = useCallback(() => {
    if (!memberId) return;
    setLoading(true);
    setError(null);
    portfolioApi
      .get(memberId)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError((e as Error)?.message || String(e)))
      .finally(() => setLoading(false));
  }, [memberId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    if (!memberId || refreshing) return;
    setRefreshing(true);
    try {
      await portfolioApi.aggregate(memberId);
      const full = await portfolioApi.get(memberId);
      setData(full);
      const t = buildRefreshToast({
        kind: 'success',
        memberName: full.member?.name ?? data?.member?.name ?? null,
      });
      toast({ title: t.title, description: t.description });
    } catch (e) {
      // Inline-ошибку в шапке не выводим — данные старого снимка остаются
      // на экране; пользователю достаточно одного destructive-тоста.
      const t = buildRefreshToast({
        kind: 'error',
        errorMessage: (e as Error)?.message || String(e),
      });
      toast({
        title: t.title,
        description: t.description,
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = async () => {
    if (!data || sharing) return;
    setSharing(true);
    try {
      const message = buildPortfolioChatMessage(data);
      const r = await shareToFamilyChat(message);
      if (r.ok) {
        toast({
          title: 'Отправлено в семейный чат',
          description: 'Карточка портфолио опубликована в семье',
        });
      } else {
        toast({
          title: 'Не получилось отправить',
          description: r.reason || 'Попробуйте ещё раз',
          variant: 'destructive',
        });
      }
    } finally {
      setSharing(false);
    }
  };

  // Единый page-shell для loading/error — стилистически совпадает с Hub
  // (gradient background, container, skeleton-блоки вместо центрального
  // спиннера, inline alert + Retry вместо «Вернуться»).
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div
          className="container mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 space-y-4"
          aria-busy="true"
          aria-live="polite"
        >
          {/* Hero skeleton */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 sm:p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
                <div className="h-2 w-2/3 rounded bg-slate-100 animate-pulse mt-2" />
              </div>
            </div>
          </div>
          {/* Body skeleton (3 секции) */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-white/60 bg-white/60 shadow-sm animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="container mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-8 px-2 text-gray-600"
            >
              <Icon name="ArrowLeft" size={14} className="mr-1" />
              Назад
            </Button>
          </div>
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-2.5"
          >
            <Icon
              name="AlertCircle"
              size={16}
              className="text-rose-600 mt-0.5 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-rose-800 mb-0.5">
                Не удалось загрузить портфолио
              </div>
              <div className="text-xs text-rose-700 mb-2 break-words">
                {error || 'Данные не пришли. Попробуйте ещё раз.'}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={load}
                  className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-100"
                >
                  <Icon name="RefreshCw" size={12} className="mr-1" />
                  Повторить
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="h-7 text-xs text-rose-700 hover:bg-rose-100"
                >
                  Назад
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const updatedHuman = formatLastAggregated(data.last_aggregated_at);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <SEOHead title={`Портфолио ${data.member.name}`} description="Паспорт развития" />
      <div className="container mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        {/* Hero action-bar (Sprint B): timestamp + Refresh CTA + secondary actions.
            Карточный фон в стиле Goals/Hub. Сам PortfolioHeader — без изменений. */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 print:hidden">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className={`w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0 ${refreshing ? 'animate-pulse' : ''}`}
              aria-hidden
            >
              <Icon name="LineChart" size={14} className="text-emerald-700" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                Паспорт развития
              </div>
              <div
                className="text-[11px] text-gray-600 truncate"
                aria-live="polite"
              >
                {refreshing
                  ? 'Собираем свежие данные…'
                  : updatedHuman
                    ? `Обновлено ${updatedHuman}`
                    : 'Данных об обновлении пока нет'}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Button
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white h-8 px-3"
              aria-label="Обновить портфолио"
            >
              <Icon
                name={refreshing ? 'Loader2' : 'RefreshCw'}
                size={13}
                className={`mr-1.5 ${refreshing ? 'animate-spin' : ''}`}
              />
              {refreshing ? 'Обновляю…' : 'Обновить'}
            </Button>
            <SourcesDrawer data={data} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={sharing}
              className="gap-1.5 h-8"
              title="Отправить карточку в семейный чат"
            >
              <Icon
                name={sharing ? 'Loader2' : 'Share2'}
                size={13}
                className={sharing ? 'animate-spin' : ''}
              />
              {sharing ? 'Отправляю…' : 'В чат семьи'}
            </Button>
            {pdfEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 h-8"
                title="Сохранить как PDF (через диалог печати)"
              >
                <Icon name="FileDown" size={13} />
                <span className="hidden sm:inline">Скачать PDF</span>
              </Button>
            )}
          </div>
        </div>

        <PortfolioSection id="profile">
          <PortfolioHeader data={data} />
        </PortfolioSection>

        <PortfolioSection id="trust">
          <TrustBlock memberId={memberId} />
        </PortfolioSection>

        <PortfolioSection
          id="highlights"
          label="Ключевые акценты"
          icon="Sparkles"
        >
          <KeyHighlights data={data} memberId={memberId ?? null} />
        </PortfolioSection>

        {/* Старый action-bar удалён — переехал в Hero выше (Sprint B.1). */}

        <PortfolioSection id="radar">
          <SpheresRadar data={data} memberId={memberId ?? null} />
        </PortfolioSection>

        <PortfolioSection id="accuracy">
          <ImproveAccuracyBlock data={data} memberId={memberId ?? null} />
        </PortfolioSection>

        {memberId && (
          <PortfolioSection id="insights">
            <InsightsBlock
              memberId={memberId}
              aiEnabled={aiEnabled}
              member={data.member}
              sphereLabelsAdult={data.sphere_labels_adult}
              sphereLabelsChild={data.sphere_labels_child}
            />
          </PortfolioSection>
        )}

        {memberId && (
          <PortfolioSection id="history">
            <HistoryChart memberId={memberId} />
          </PortfolioSection>
        )}

        <PortfolioSection id="table">
          <DevelopmentTable data={data} />
        </PortfolioSection>

        <PortfolioSection id="plan-and-achievements">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ActiveDevelopmentPlan
              data={data}
              memberId={memberId}
              onChanged={handleRefresh}
            />
            <AchievementsWall data={data} />
          </div>
        </PortfolioSection>

        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Icon name="Info" size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground flex-1">
              <p className="font-medium mb-1 text-foreground">Как читать портфолио</p>
              <p>
                Это <span className="font-medium">карта развития</span> {data.member.name}.
                Сравнение идёт <span className="font-medium">с самим собой во времени</span>,
                а не с другими. Если по сфере мало данных — балл не показывается, чтобы не делать
                поспешных выводов.
              </p>
              <Link
                to="/portfolio/about"
                onClick={() =>
                  track('portfolio_about_open', {
                    member_id: memberId,
                    props: { source: 'bottom_info_card' },
                  })
                }
                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline"
              >
                Подробнее о методике
                <Icon name="ArrowRight" size={12} />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}