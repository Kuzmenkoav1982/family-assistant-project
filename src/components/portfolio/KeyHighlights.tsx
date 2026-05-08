import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { PortfolioData } from '@/types/portfolio.types';

interface KeyHighlightsProps {
  data: PortfolioData;
}

export default function KeyHighlights({ data }: KeyHighlightsProps) {
  const topStrength = data.strengths[0];
  const topGrowth = data.growth_zones[0];
  const topAction = data.next_actions.find((a) => a.source === 'plan')
    || data.next_actions.find((a) => a.source === 'rule_low_score')
    || data.next_actions[0];

  if (!topStrength && !topGrowth && !topAction) return null;

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Sparkles" size={16} className="text-primary" />
          <h3 className="text-sm font-semibold">Главное сейчас</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topStrength && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-500/5 border border-green-500/15">
              <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                <Icon name={topStrength.icon} size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                  Сильнее всего
                </p>
                <p className="text-sm font-semibold truncate">
                  {topStrength.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(topStrength.score)} из 100
                </p>
              </div>
            </div>
          )}

          {topGrowth && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <Icon name={topGrowth.icon} size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                  Точка внимания
                </p>
                <p className="text-sm font-semibold truncate">
                  {topGrowth.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(topGrowth.score)} из 100
                </p>
              </div>
            </div>
          )}

          {topAction && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/15">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Icon name="ArrowRight" size={16} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                  Следующий шаг
                </p>
                <p className="text-sm font-semibold leading-snug line-clamp-2">
                  {topAction.action}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {topAction.sphere_label}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
