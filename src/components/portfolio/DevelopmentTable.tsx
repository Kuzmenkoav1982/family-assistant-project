import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { SPHERE_ORDER, type PortfolioData, type SphereKey } from '@/types/portfolio.types';
import { getConfidenceMeta, getNextStepText } from '@/utils/portfolioConfidence';

interface DevelopmentTableProps {
  data: PortfolioData;
}

function levelLabel(score: number, conf: number): string {
  if (conf < 40) return 'Недостаточно данных';
  if (score >= 80) return 'Высокий';
  if (score >= 60) return 'Хороший';
  if (score >= 40) return 'Средний';
  return 'Зона роста';
}

function levelColor(score: number, conf: number): string {
  if (conf < 40) return 'text-muted-foreground';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-orange-600';
}

export default function DevelopmentTable({ data }: DevelopmentTableProps) {
  const planBySphere = new Map(data.plans.map((p) => [p.sphere_key, p]));
  const actionBySphere = new Map(data.next_actions.map((a) => [a.sphere, a]));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="LayoutGrid" size={20} className="text-primary" />
          Сводная таблица развития
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Сфера</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Уровень</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">
                  Динамика 90д
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">
                  Основание
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">
                  План
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground">
                  Следующий шаг
                </th>
              </tr>
            </thead>
            <tbody>
              {SPHERE_ORDER.map((sphere: SphereKey) => {
                const score = data.scores[sphere] ?? 0;
                const conf = data.confidence[sphere] ?? 0;
                const delta = data.deltas[sphere] ?? 0;
                const plan = planBySphere.get(sphere);
                const action = actionBySphere.get(sphere);
                const dim = conf < 40;
                return (
                  <tr
                    key={sphere}
                    className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${
                      dim ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Icon
                          name={data.sphere_icons[sphere]}
                          size={16}
                          className="text-primary"
                        />
                        <span className="font-medium">{data.sphere_labels_child[sphere]}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${levelColor(score, conf)}`}>
                          {dim ? '—' : Math.round(score)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {levelLabel(score, conf)}
                        </span>
                      </div>
                      {(() => {
                        const cm = getConfidenceMeta(conf);
                        return (
                          <div
                            className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] border ${cm.bg} ${cm.color}`}
                            title={`${cm.label} · ${Math.round(conf)}%`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cm.dot}`} />
                            {cm.short}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {dim ? (
                        <span className="text-muted-foreground">—</span>
                      ) : delta === 0 ? (
                        <span className="text-muted-foreground">→ 0</span>
                      ) : delta > 0 ? (
                        <span className="text-green-600">↗ +{delta.toFixed(1)}</span>
                      ) : (
                        <span className="text-orange-600">↘ {delta.toFixed(1)}</span>
                      )}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {data.recent_metrics
                          .filter((m) => m.sphere_key === sphere)
                          .slice(0, 1)
                          .map(() => `${data.sphere_labels_child[sphere]}: ${data.recent_metrics.filter((m) => m.sphere_key === sphere).length} источников`)
                          .join('') || '—'}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {plan ? (
                        <Badge variant="outline" className="text-xs">
                          {plan.title}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <p className="text-xs text-foreground/80 max-w-xs">
                        {getNextStepText(action?.action, score, conf)}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}