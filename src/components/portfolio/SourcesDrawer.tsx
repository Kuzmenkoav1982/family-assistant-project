import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  SPHERE_ORDER,
  type PortfolioData,
  type PortfolioMetric,
  type SphereKey,
} from '@/types/portfolio.types';
import {
  getSourceTypeLabel,
  getMetricKeyLabel,
  formatMetricValue,
  humanizeRawValue,
} from '@/utils/portfolioLabels';
import {
  getSourceEntry,
  SOURCE_CATEGORY_META,
  type SourceCategory,
} from '@/data/portfolioSourcesRegistry';
import { track } from '@/lib/analytics';

interface SourcesDrawerProps {
  data: PortfolioData;
}

type GroupMode = 'sphere' | 'status';
type FreshnessStatus = 'fresh' | 'stale';

interface MetricMeta {
  m: PortfolioMetric;
  category: SourceCategory;
  status: FreshnessStatus;
  freshnessDays: number | null;
  route: string | null;
  ctaText: string;
}

const CATEGORY_BADGE_COLORS: Record<SourceCategory, string> = {
  parent: 'border-purple-400/50 text-purple-700 dark:text-purple-300 bg-purple-500/5',
  family: 'border-blue-400/50 text-blue-700 dark:text-blue-300 bg-blue-500/5',
  auto: 'border-slate-400/50 text-slate-700 dark:text-slate-300 bg-slate-500/5',
  achievement: 'border-amber-400/50 text-amber-700 dark:text-amber-300 bg-amber-500/5',
  plan: 'border-green-400/50 text-green-700 dark:text-green-300 bg-green-500/5',
};

function annotate(metrics: PortfolioMetric[]): MetricMeta[] {
  return metrics.map((m) => {
    const entry = getSourceEntry(m.source_type);
    const category: SourceCategory = entry?.category ?? 'auto';
    const route = entry?.route ?? null;
    const ctaText = entry?.cta_text ?? 'Открыть раздел';
    let status: FreshnessStatus = 'fresh';
    let freshnessDays: number | null = null;
    if (m.measured_at) {
      const days = Math.floor(
        (Date.now() - new Date(m.measured_at).getTime()) / (1000 * 60 * 60 * 24),
      );
      freshnessDays = days;
      const limit = entry?.freshness_days ?? 60;
      if (days > limit) status = 'stale';
    }
    return { m, category, status, freshnessDays, route, ctaText };
  });
}

export default function SourcesDrawer({ data }: SourcesDrawerProps) {
  const [open, setOpen] = useState(false);
  const [sphereFilter, setSphereFilter] = useState<SphereKey | 'all'>('all');
  const [groupMode, setGroupMode] = useState<GroupMode>('sphere');

  const annotated = useMemo(() => annotate(data.recent_metrics), [data.recent_metrics]);

  const filtered = useMemo(() => {
    return sphereFilter === 'all'
      ? annotated
      : annotated.filter((x) => x.m.sphere_key === sphereFilter);
  }, [annotated, sphereFilter]);

  const staleCount = filtered.filter((x) => x.status === 'stale').length;
  const freshCount = filtered.length - staleCount;

  const handleDeepLink = (meta: MetricMeta) => {
    if (!meta.route) return;
    track('portfolio_source_deep_link_click', {
      props: {
        sphere: meta.m.sphere_key,
        source_type: meta.m.source_type,
        route: meta.route,
        source: 'sources_drawer',
      },
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon name="Database" size={14} />
          Источники данных
          <Badge variant="secondary" className="ml-1 text-[10px]">
            {data.recent_metrics.length}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Icon name="Database" size={20} />
            На чём основаны оценки
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 p-3 rounded-lg border border-primary/20 bg-primary/5">
          <p className="text-xs text-foreground/80 leading-relaxed">
            Картина по сферам собирается из данных семьи: наблюдений, привычек, активностей и
            достижений. Чем больше свежих данных из разных источников, тем точнее результат.
          </p>
          <Link
            to="/portfolio/about"
            onClick={() =>
              track('portfolio_about_open', {
                props: { source: 'sources_drawer' },
              })
            }
            className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium text-primary hover:underline"
          >
            Подробнее о методике
            <Icon name="ArrowRight" size={10} />
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="inline-flex p-0.5 rounded-md border bg-muted/30">
            <button
              type="button"
              onClick={() => setGroupMode('sphere')}
              className={`px-2.5 py-1 text-[11px] rounded-sm transition-colors ${
                groupMode === 'sphere'
                  ? 'bg-background shadow-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              По сферам
            </button>
            <button
              type="button"
              onClick={() => setGroupMode('status')}
              className={`px-2.5 py-1 text-[11px] rounded-sm transition-colors ${
                groupMode === 'status'
                  ? 'bg-background shadow-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              По статусу
            </button>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {freshCount} свежих · {staleCount} давних
          </div>
        </div>

        {groupMode === 'sphere' && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Button
              variant={sphereFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSphereFilter('all')}
              className="text-xs h-7"
            >
              Все ({data.recent_metrics.length})
            </Button>
            {SPHERE_ORDER.map((s: SphereKey) => {
              const count = data.recent_metrics.filter((m) => m.sphere_key === s).length;
              if (count === 0) return null;
              return (
                <Button
                  key={s}
                  variant={sphereFilter === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSphereFilter(s)}
                  className="text-xs h-7"
                >
                  <Icon name={data.sphere_icons[s]} size={12} className="mr-1" />
                  {data.sphere_labels_child[s]} ({count})
                </Button>
              );
            })}
          </div>
        )}

        <div className="mt-4 space-y-4">
          {groupMode === 'status' ? (
            <StatusGroups items={filtered} data={data} onDeepLink={handleDeepLink} />
          ) : (
            <div className="space-y-2">
              {filtered.map((meta, i) => (
                <SourceCard
                  key={i}
                  meta={meta}
                  data={data}
                  onDeepLink={handleDeepLink}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Нет данных в этой сфере
                </p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatusGroups({
  items,
  data,
  onDeepLink,
}: {
  items: MetricMeta[];
  data: PortfolioData;
  onDeepLink: (m: MetricMeta) => void;
}) {
  const fresh = items.filter((x) => x.status === 'fresh');
  const stale = items.filter((x) => x.status === 'stale');
  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">Нет данных в этой сфере</p>
    );
  }
  return (
    <div className="space-y-5">
      {fresh.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Icon name="CheckCircle2" size={14} className="text-green-600" />
            <p className="text-xs font-semibold">Учтено в картине</p>
            <Badge variant="secondary" className="text-[10px]">
              {fresh.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {fresh.map((meta, i) => (
              <SourceCard key={i} meta={meta} data={data} onDeepLink={onDeepLink} />
            ))}
          </div>
        </div>
      )}
      {stale.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Icon name="Clock" size={14} className="text-amber-600" />
            <p className="text-xs font-semibold">Давно не обновлялось</p>
            <Badge variant="secondary" className="text-[10px]">
              {stale.length}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2 px-1">
            Эти записи всё ещё учитываются, но обновите их — и картина станет точнее.
          </p>
          <div className="space-y-2">
            {stale.map((meta, i) => (
              <SourceCard key={i} meta={meta} data={data} onDeepLink={onDeepLink} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceCard({
  meta,
  data,
  onDeepLink,
}: {
  meta: MetricMeta;
  data: PortfolioData;
  onDeepLink: (m: MetricMeta) => void;
}) {
  const { m, category, status, freshnessDays, route, ctaText } = meta;
  const categoryMeta = SOURCE_CATEGORY_META[category];
  const categoryClass = CATEGORY_BADGE_COLORS[category];

  return (
    <div
      className={`p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors ${
        status === 'stale' ? 'border-dashed' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <Icon
            name={data.sphere_icons[m.sphere_key]}
            size={14}
            className="text-primary flex-shrink-0"
          />
          <span className="text-sm font-medium truncate">
            {data.sphere_labels_child[m.sphere_key]}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge
            variant="outline"
            className={`text-[10px] gap-1 ${categoryClass}`}
            title={categoryMeta.description}
          >
            <Icon name={categoryMeta.icon} size={10} />
            {categoryMeta.label}
          </Badge>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs gap-2">
        <span className="text-muted-foreground truncate">
          {getMetricKeyLabel(m.metric_key)}
          <span className="text-[10px] text-muted-foreground/70 ml-1">
            · {getSourceTypeLabel(m.source_type)}
          </span>
        </span>
        {m.metric_value !== null && (
          <span className="font-semibold whitespace-nowrap">
            {formatMetricValue(m.metric_value, m.metric_unit)}
          </span>
        )}
      </div>
      {m.raw_value && (
        <p className="text-xs text-muted-foreground mt-1 italic">
          {humanizeRawValue(m.raw_value)}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 mt-1.5">
        <p
          className={`text-[10px] ${
            status === 'stale' ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'
          }`}
        >
          {status === 'stale' && freshnessDays !== null ? (
            <>обновлено {freshnessDays} дн. назад</>
          ) : (
            new Date(m.measured_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          )}
        </p>
        {route && (
          <Link
            to={route}
            onClick={() => onDeepLink(meta)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline whitespace-nowrap"
          >
            {ctaText}
            <Icon name="ArrowRight" size={10} />
          </Link>
        )}
      </div>
    </div>
  );
}
