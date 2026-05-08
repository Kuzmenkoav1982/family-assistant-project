import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { SPHERE_ORDER, type PortfolioData, type SphereKey } from '@/types/portfolio.types';
import { getConfidenceMeta, getNextStepText } from '@/utils/portfolioConfidence';

interface DevelopmentTableProps {
  data: PortfolioData;
}

function pluralSources(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'источник';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'источника';
  return 'источников';
}

function formatLastDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'сегодня';
  if (diffDays === 1) return 'вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
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

  const metricsBySphere = new Map<SphereKey, { count: number; lastDate: string | null }>();
  for (const m of data.recent_metrics) {
    const cur = metricsBySphere.get(m.sphere_key) || { count: 0, lastDate: null };
    cur.count += 1;
    if (!cur.lastDate || new Date(m.measured_at) > new Date(cur.lastDate)) {
      cur.lastDate = m.measured_at;
    }
    metricsBySphere.set(m.sphere_key, cur);
  }

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
                        <span className="text-muted-foreground text-xs">без изменений</span>
                      ) : delta > 0 ? (
                        <span className="text-green-600">↗ +{delta.toFixed(1)}</span>
                      ) : (
                        <span className="text-orange-600">↘ {delta.toFixed(1)}</span>
                      )}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {(() => {
                        const meta = metricsBySphere.get(sphere);
                        if (!meta || meta.count === 0) {
                          return (
                            <span className="text-xs text-muted-foreground italic">
                              данных нет
                            </span>
                          );
                        }
                        return (
                          <div className="text-xs text-muted-foreground leading-tight">
                            <div>
                              {meta.count} {pluralSources(meta.count)}
                            </div>
                            {meta.lastDate && (
                              <div className="text-[10px] opacity-80">
                                последний: {formatLastDate(meta.lastDate)}
                              </div>
                            )}
                          </div>
                        );
                      })()}
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