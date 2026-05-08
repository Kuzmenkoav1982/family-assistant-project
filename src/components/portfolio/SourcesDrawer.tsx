import { useState } from 'react';
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
import { SPHERE_ORDER, type PortfolioData, type SphereKey } from '@/types/portfolio.types';
import {
  getSourceTypeLabel,
  getMetricKeyLabel,
  formatMetricValue,
  humanizeRawValue,
} from '@/utils/portfolioLabels';

interface SourcesDrawerProps {
  data: PortfolioData;
}

export default function SourcesDrawer({ data }: SourcesDrawerProps) {
  const [open, setOpen] = useState(false);
  const [sphereFilter, setSphereFilter] = useState<SphereKey | 'all'>('all');

  const filtered =
    sphereFilter === 'all'
      ? data.recent_metrics
      : data.recent_metrics.filter((m) => m.sphere_key === sphereFilter);

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

        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-1.5">
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

          <div className="space-y-2">
            {filtered.map((m, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      name={data.sphere_icons[m.sphere_key]}
                      size={14}
                      className="text-primary flex-shrink-0"
                    />
                    <span className="text-sm font-medium">
                      {data.sphere_labels_child[m.sphere_key]}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {getSourceTypeLabel(m.source_type)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-muted-foreground truncate">
                    {getMetricKeyLabel(m.metric_key)}
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
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(m.measured_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Нет данных в этой сфере
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}