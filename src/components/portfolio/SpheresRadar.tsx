import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { SPHERE_ORDER, type PortfolioData, type SphereKey } from '@/types/portfolio.types';
import { getConfidenceMeta } from '@/utils/portfolioConfidence';

interface SpheresRadarProps {
  data: PortfolioData;
}

export default function SpheresRadar({ data }: SpheresRadarProps) {
  const [showPrev, setShowPrev] = useState(true);

  const chartData = SPHERE_ORDER.map((sphere) => ({
    sphere,
    label: data.sphere_labels_child[sphere],
    Сейчас: data.scores[sphere] ?? 0,
    'Было 3 мес. назад': data.previous_scores ? data.previous_scores[sphere] ?? 0 : 0,
    confidence: data.confidence[sphere] ?? 0,
  }));

  const hasPrev = !!data.previous_scores;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="Radar" size={20} className="text-primary" />
          Радар развития
        </CardTitle>
        {hasPrev && (
          <div className="inline-flex items-center rounded-full border bg-muted/30 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setShowPrev(false)}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                !showPrev ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
              }`}
            >
              Только сейчас
            </button>
            <button
              type="button"
              onClick={() => setShowPrev(true)}
              className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                showPrev ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
              }`}
            >
              <Icon name="History" size={11} />
              С динамикой
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 items-center">
          <div className="w-full h-[420px] md:h-[500px] lg:h-[460px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                {showPrev && hasPrev && (
                  <Radar
                    name="Было 3 мес. назад"
                    dataKey="Было 3 мес. назад"
                    stroke="hsl(var(--muted-foreground))"
                    fill="hsl(var(--muted-foreground))"
                    fillOpacity={0.15}
                    strokeDasharray="4 4"
                  />
                )}
                <Radar
                  name="Сейчас"
                  dataKey="Сейчас"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.35}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {(() => {
            const scoreVals = SPHERE_ORDER.map((s) => data.scores[s] ?? 0);
            const confVals = SPHERE_ORDER.map((s) => data.confidence[s] ?? 0);
            const avgScore = Math.round(
              scoreVals.reduce((a, b) => a + b, 0) / scoreVals.length,
            );
            const avgConf = Math.round(
              confVals.reduce((a, b) => a + b, 0) / confVals.length,
            );
            const topDelta = SPHERE_ORDER
              .map((s) => ({ s, d: data.deltas[s] ?? 0 }))
              .reduce(
                (best, cur) => (Math.abs(cur.d) > Math.abs(best.d) ? cur : best),
                { s: SPHERE_ORDER[0], d: 0 },
              );
            return (
              <div className="space-y-3">
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                    Средний уровень
                  </p>
                  <p className="text-2xl font-bold text-primary">{avgScore}</p>
                  <p className="text-[10px] text-muted-foreground">из 100</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                    Полнота картины
                  </p>
                  <p className="text-2xl font-bold">{avgConf}%</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    зависит от полноты, свежести и разнообразия данных
                  </p>
                </div>
                {topDelta.d !== 0 && (
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                      Главная динамика
                    </p>
                    <p
                      className={`text-base font-semibold ${
                        topDelta.d > 0 ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      {topDelta.d > 0 ? '↗ +' : '↘ '}
                      {topDelta.d.toFixed(1)}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {data.sphere_labels_child[topDelta.s]}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t">
          {SPHERE_ORDER.map((sphere: SphereKey) => {
            const score = data.scores[sphere] ?? 0;
            const conf = data.confidence[sphere] ?? 0;
            const delta = data.deltas[sphere] ?? 0;
            const dim = conf < 40;
            const cm = getConfidenceMeta(conf);
            return (
              <div
                key={sphere}
                className={`p-2 rounded-lg border ${dim ? 'opacity-60' : ''}`}
                title={`${cm.label} · ${Math.round(conf)}%`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <Icon name={data.sphere_icons[sphere]} size={14} className="text-primary" />
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${cm.dot}`}
                      aria-label={cm.label}
                    />
                  </div>
                  <span className="text-base font-bold">
                    {dim ? '—' : Math.round(score)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {data.sphere_labels_child[sphere]}
                </p>
                {!dim && delta !== 0 && (
                  <p
                    className={`text-xs mt-0.5 ${
                      delta > 0 ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {delta > 0 ? '↗' : '↘'} {Math.abs(delta).toFixed(1)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Полная картина
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Предварительно
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            Данных мало
          </span>
        </div>
      </CardContent>
    </Card>
  );
}